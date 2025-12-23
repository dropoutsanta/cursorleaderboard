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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Initializing...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-red-400 font-mono text-sm border border-red-500/20 bg-red-500/10 px-4 py-2 rounded">
            {error}
          </div>
          <Link href="/" className="inline-block text-zinc-500 hover:text-white transition-colors text-sm font-mono border-b border-transparent hover:border-white pb-0.5">
            ← RETURN TO TERMINAL
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tighter text-white">
            Leaderboard
          </h1>
          <div className="flex items-center gap-3 text-sm text-zinc-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>LIVE DATA • 2025 WRAPPED</span>
          </div>
        </div>
        <Link
          href="/"
          className="group px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <span>SUBMIT STATS</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </header>

      {submissions.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500 font-mono">No data entries found.</p>
        </div>
      ) : (
        <div className="backdrop-blur-sm bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium w-20">Rank</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium">User</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium text-right">Tokens</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium text-right">Agents</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium text-right">Tabs</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium text-right">Streak</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium hidden md:table-cell">Top Models</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map((submission, index) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;
                  
                  return (
                    <tr
                      key={submission.id}
                      className={`group transition-colors hover:bg-white/[0.02] ${
                        isTopThree ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <span className={`font-mono text-sm ${
                          rank === 1 ? 'text-yellow-400' :
                          rank === 2 ? 'text-zinc-300' :
                          rank === 3 ? 'text-amber-700' :
                          'text-zinc-600'
                        }`}>
                          #{rank.toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono border ${
                            isTopThree ? 'border-white/20 bg-white/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                          }`}>
                            {submission.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-medium text-sm ${isTopThree ? 'text-white' : 'text-zinc-300'}`}>
                              {submission.name}
                            </div>
                            {submission.usage_percentile && (
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                Top {submission.usage_percentile}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-mono text-sm text-white font-medium bg-white/5 px-2 py-1 rounded">
                          {formatTokens(submission.tokens)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-mono text-sm text-zinc-400">
                          {formatNumber(submission.agents)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-mono text-sm text-zinc-400">
                          {formatNumber(submission.tabs)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-mono text-sm text-zinc-400">
                          {submission.streak ? `${submission.streak}d` : '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        {submission.top_models && submission.top_models.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {submission.top_models.slice(0, 2).map((model) => (
                              <span key={model} className="px-2 py-0.5 rounded border border-white/5 bg-black/20 text-[10px] text-zinc-500 font-mono">
                                {model}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-700 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
