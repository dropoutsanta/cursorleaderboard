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
  top_models: string[] | null;
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

function formatNumber(num: number | null): string {
  if (num === null) return '-';
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
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
    .select('id, name, tokens, agents, tabs, streak, usage_percentile, top_models')
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

  // Get 3 above and 3 below (fewer for square format)
  const startIndex = Math.max(0, userIndex - 3);
  const endIndex = Math.min(submissions.length, userIndex + 4);
  const surroundingUsers = submissions.slice(startIndex, endIndex);

  // Calculate the user's percentile
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
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          padding: '32px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #2b2b2b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#71717a', fontFamily: 'ui-monospace, monospace' }}>
            <span>cursor-wrapped</span>
            <span>/</span>
            <span style={{ color: '#d4d4d8' }}>leaderboard</span>
          </div>
          <div style={{ fontSize: '20px', color: '#3799FF', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
            #{userRank} of {totalUsers}
          </div>
        </div>

        {/* User's Highlight Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1e3a5f',
            border: '2px solid #3799FF',
            padding: '24px',
            marginBottom: '24px',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px', color: '#3799FF', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
              #{userRank}
            </span>
            <span style={{ fontSize: '28px', color: '#ffffff', fontWeight: 600 }}>
              {user.name}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '14px', color: '#a1a1aa' }}>Tokens</span>
              <span style={{ fontSize: '24px', color: '#ffffff', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                {formatTokens(user.tokens)}
              </span>
            </div>
            {user.agents !== null && user.agents !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '14px', color: '#a1a1aa' }}>Agents</span>
                <span style={{ fontSize: '24px', color: '#ffffff', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                  {formatNumber(user.agents)}
                </span>
              </div>
            )}
            {user.streak !== null && user.streak !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '14px', color: '#a1a1aa' }}>Streak</span>
                <span style={{ fontSize: '24px', color: '#ffffff', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                  {user.streak}d
                </span>
              </div>
            )}
          </div>
          {user.top_models && user.top_models.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {user.top_models.slice(0, 3).map((model, idx) => (
                <span
                  key={idx}
                  style={{
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    backgroundColor: '#2b2b2b',
                    border: '1px solid #3e3e3e',
                    color: '#a1a1aa',
                    fontSize: '14px',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {model}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Surrounding Users - Compact List */}
        {surroundingUsers.length > 1 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '24px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '8px', fontFamily: 'ui-monospace, monospace' }}>
              NEARBY RANKS
            </div>
            {surroundingUsers
              .filter((submission) => submission.id !== id)
              .map((submission) => {
                const originalIdx = surroundingUsers.findIndex((s) => s.id === submission.id);
                const rank = startIndex + originalIdx + 1;
                
                return (
                  <div
                    key={submission.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      fontSize: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '40px', color: '#71717a', fontFamily: 'ui-monospace, monospace', fontSize: '16px' }}>
                        #{rank}
                      </span>
                      <span style={{ color: '#a1a1aa', fontSize: '18px' }}>
                        {submission.name}
                      </span>
                    </div>
                    <span style={{ color: '#d4d4d8', fontFamily: 'ui-monospace, monospace', fontSize: '18px', fontWeight: 600 }}>
                      {formatTokens(submission.tokens)}
                    </span>
                  </div>
                );
              })}
          </div>
        ) : null}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '20px',
            borderTop: '1px solid #2b2b2b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#71717a', fontFamily: 'ui-monospace, monospace' }}>
            <span style={{ color: '#3799FF', fontWeight: 600 }}>{percentileText}</span>
            {user.usage_percentile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>·</span>
                <span>{user.usage_percentile} usage</span>
              </div>
            ) : null}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#3799FF', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
            <span>See where YOU rank</span>
            <span>→</span>
            <span style={{ opacity: 0.8 }}>cursorwrapped.com</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
    }
  );
}
