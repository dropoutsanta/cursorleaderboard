import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

interface Submission {
  id: string;
  name: string;
  tokens: string;
  agents: number | null;
  tabs: number | null;
  streak: number | null;
  usage_percentile: string | null;
}

function formatTokens(tokens: string): string {
  const num = BigInt(tokens);
  if (num >= 1_000_000_000n) {
    return `${(Number(num) / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000n) {
    return `${(Number(num) / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000n) {
    return `${(Number(num) / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch all submissions ordered by tokens
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, name, tokens, agents, tabs, streak, usage_percentile')
    .order('tokens', { ascending: false });

  if (error || !submissions) {
    return new Response('Failed to fetch leaderboard', { status: 500 });
  }

  // Find the user's position
  const userIndex = submissions.findIndex((s) => s.id === id);
  
  if (userIndex === -1) {
    return new Response('User not found', { status: 404 });
  }

  const user = submissions[userIndex];
  const userRank = userIndex + 1;
  const totalUsers = submissions.length;

  // Get 5 above and 5 below (or as many as available)
  const startIndex = Math.max(0, userIndex - 5);
  const endIndex = Math.min(submissions.length, userIndex + 6);
  const surroundingUsers = submissions.slice(startIndex, endIndex);

  // Calculate the user's percentile (what position they're in, as a percentage)
  const percentile = (userRank / totalUsers) * 100;
  const percentileText = 
    userRank === 1 ? 'Top 1%' : 
    percentile <= 1 ? 'Top 1%' : 
    percentile <= 5 ? 'Top 5%' : 
    percentile <= 10 ? 'Top 10%' : 
    percentile <= 25 ? 'Top 25%' : 
    percentile <= 50 ? 'Top 50%' :
    `Top ${Math.round(percentile)}%`;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#111111',
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid #2b2b2b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3799FF',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ color: '#fafafa', fontSize: '24px', fontWeight: 600 }}>
              Cursor Wrapped Leaderboard
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#3799FF',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            #{userRank} of {totalUsers}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: '2px',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'flex',
              padding: '12px 16px',
              backgroundColor: '#18181b',
              borderRadius: '8px 8px 0 0',
              fontSize: '11px',
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            <span style={{ width: '60px' }}>#</span>
            <span style={{ flex: 1 }}>User</span>
            <span style={{ width: '140px', textAlign: 'right' }}>Tokens</span>
            <span style={{ width: '80px', textAlign: 'right' }}>Agents</span>
            <span style={{ width: '80px', textAlign: 'right' }}>Streak</span>
          </div>

          {/* Table Rows */}
          {surroundingUsers.map((submission, idx) => {
            const rank = startIndex + idx + 1;
            const isCurrentUser = submission.id === id;

            return (
              <div
                key={submission.id}
                style={{
                  display: 'flex',
                  padding: '14px 16px',
                  backgroundColor: isCurrentUser ? '#1e3a5f' : idx % 2 === 0 ? '#1a1a1a' : '#161616',
                  borderLeft: isCurrentUser ? '4px solid #3799FF' : '4px solid transparent',
                  alignItems: 'center',
                  fontSize: '15px',
                }}
              >
                <span
                  style={{
                    width: '56px',
                    color: isCurrentUser ? '#3799FF' : '#71717a',
                    fontWeight: isCurrentUser ? 700 : 400,
                    fontFamily: 'monospace',
                  }}
                >
                  {rank}
                </span>
                <div
                  style={{
                    flex: 1,
                    color: isCurrentUser ? '#ffffff' : '#a1a1aa',
                    fontWeight: isCurrentUser ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isCurrentUser && (
                    <span
                      style={{
                        backgroundColor: '#3799FF',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      YOU
                    </span>
                  )}
                  <span>{submission.name}</span>
                </div>
                <span
                  style={{
                    width: '140px',
                    textAlign: 'right',
                    color: isCurrentUser ? '#ffffff' : '#d4d4d8',
                    fontFamily: 'monospace',
                    fontWeight: isCurrentUser ? 600 : 400,
                  }}
                >
                  {formatTokens(submission.tokens)}
                </span>
                <span
                  style={{
                    width: '80px',
                    textAlign: 'right',
                    color: '#71717a',
                    fontFamily: 'monospace',
                  }}
                >
                  {submission.agents ?? '-'}
                </span>
                <span
                  style={{
                    width: '80px',
                    textAlign: 'right',
                    color: '#71717a',
                    fontFamily: 'monospace',
                  }}
                >
                  {submission.streak ? `${submission.streak}d` : '-'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer / CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #2b2b2b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#27272a',
                padding: '8px 14px',
                borderRadius: '6px',
                color: '#a1a1aa',
                fontSize: '14px',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ color: '#3799FF', fontWeight: 600 }}>{percentileText}</span>
              <span>of all users</span>
            </div>
            {user.usage_percentile && (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#27272a',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  color: '#a1a1aa',
                  fontSize: '14px',
                }}
              >
                {user.usage_percentile} Cursor usage
              </div>
            )}
          </div>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#3799FF',
              padding: '12px 20px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            <span>See where YOU rank</span>
            <span style={{ fontSize: '20px' }}>→</span>
            <span style={{ opacity: 0.9 }}>cursorwrapped.com</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
