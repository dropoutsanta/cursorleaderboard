'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  name: string;
  tokens: string;
  agents: number | null;
  tabs: number | null;
  streak: number | null;
  usage_percentile: string | null;
  top_models: string[] | null;
  joined_days_ago: number | null;
  created_at: string;
}

function formatTokens(tokens: string): string {
  const num = BigInt(tokens);
  if (num >= 1_000_000_000n) {
    return `${(Number(num) / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000n) {
    return `${(Number(num) / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000n) {
    return `${(Number(num) / 1_000).toFixed(2)}K`;
  }
  return num.toString();
}

function formatNumber(num: number | null): string {
  if (num === null) return '—';
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

export default function LeaderboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSubmissions(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load leaderboard');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-gray-400">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Link href="/" className="text-orange-500 hover:text-orange-400 underline">
            ← Back to Submit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4">
      <div className="max-w-6xl mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-gray-400">Ranked by tokens spent in 2025</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition-colors"
          >
            Submit Your Stats
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No submissions yet. Be the first!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">Rank</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">Name</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold">Tokens</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold">Agents</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold">Tabs</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-semibold">Streak</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">Usage</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;
                  
                  return (
                    <tr
                      key={submission.id}
                      className={`border-b border-gray-800 hover:bg-[#2a2a2a] transition-colors ${
                        isTopThree ? 'bg-[#2a2a2a]/50' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span className={`font-mono ${isTopThree ? 'text-orange-500 font-bold text-lg' : 'text-gray-300'}`}>
                          #{rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold">{submission.name}</div>
                        {submission.top_models && submission.top_models.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {submission.top_models.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-bold text-lg text-orange-500">
                          {formatTokens(submission.tokens)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-gray-300">
                        {formatNumber(submission.agents)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-gray-300">
                        {formatNumber(submission.tabs)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-gray-300">
                        {submission.streak ? `${submission.streak}d` : '—'}
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {submission.usage_percentile || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

