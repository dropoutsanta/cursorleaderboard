import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedStats {
  tokens: string;
  agents?: string;
  tabs?: string;
  streak?: string;
  usage_percentile?: string;
  top_models?: string[];
  joined_days_ago?: number;
}

function parseTokens(tokenStr: string): bigint {
  // Remove commas and parse
  const cleaned = tokenStr.replace(/,/g, '').toUpperCase();
  
  if (cleaned.endsWith('B')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return BigInt(Math.floor(num * 1_000_000_000));
  } else if (cleaned.endsWith('M')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return BigInt(Math.floor(num * 1_000_000));
  } else if (cleaned.endsWith('K')) {
    const num = parseFloat(cleaned.slice(0, -1));
    return BigInt(Math.floor(num * 1_000));
  }
  
  return BigInt(Math.floor(parseFloat(cleaned) || 0));
}

function parseNumber(str: string | undefined): number | null {
  if (!str) return null;
  const cleaned = str.replace(/,/g, '').replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.floor(num);
}

function parseDaysAgo(str: string | undefined): number | null {
  if (!str) return null;
  const match = str.match(/(\d+)\s*days?/i);
  return match ? parseInt(match[1]) : null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const screenshot = formData.get('screenshot') as File;

    if (!name || !email || !screenshot) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Email already submitted' },
        { status: 400 }
      );
    }

    // Convert file to base64 for OpenAI
    const arrayBuffer = await screenshot.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = screenshot.type || 'image/png';

    // Extract stats using OpenAI Vision
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract the following statistics from this Cursor 2025 Wrapped screenshot. Return ONLY a JSON object with these exact keys:
{
  "tokens": "the token count (e.g., '6.60B', '1.2M', '500K')",
  "agents": "the agents count (e.g., '17K', '1.2K')",
  "tabs": "the tabs count (e.g., '4.3K', '500')",
  "streak": "the streak in days (e.g., '56d', '30 days')",
  "usage_percentile": "the usage percentile (e.g., 'Top 5%', 'Top 10%')",
  "top_models": ["model1", "model2", "model3"],
  "joined_days_ago": number
}

If any value is not visible, use null for that field. Be precise with the token count - it's the main metric.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to extract stats from image');
    }

    // Parse the JSON response
    let extractedStats: ExtractedStats;
    try {
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedStats = JSON.parse(jsonContent);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse extracted stats');
    }

    // Upload screenshot to Supabase Storage
    const fileExt = screenshot.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(fileName, screenshot, {
        contentType: screenshot.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload screenshot');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    // Parse and prepare data for database
    const tokens = parseTokens(extractedStats.tokens || '0');
    const agents = parseNumber(extractedStats.agents);
    const tabs = parseNumber(extractedStats.tabs);
    const streak = parseNumber(extractedStats.streak?.replace(/d$/i, ''));
    const joinedDaysAgo = extractedStats.joined_days_ago || parseDaysAgo(extractedStats.joined_days_ago?.toString());

    // Insert into database
    const { error: dbError } = await supabase.from('submissions').insert({
      name,
      email,
      screenshot_url: urlData.publicUrl,
      tokens: tokens.toString(),
      agents,
      tabs,
      streak,
      usage_percentile: extractedStats.usage_percentile || null,
      top_models: extractedStats.top_models || null,
      joined_days_ago: joinedDaysAgo,
    });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save submission');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

