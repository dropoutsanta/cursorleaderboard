'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Layers, Activity, Search, Terminal, ArrowUpRight, Filter, Download, ImageIcon, X, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  screenshot_url?: string;
  social_link?: string;
  social_handle?: string;
  social_provider?: string;
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
  if (num === null) return '-';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

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

  const filteredSubmissions = submissions.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-4 h-4 bg-cursor-blue animate-pulse rounded-sm" />
          <div className="text-zinc-500 font-mono text-xs">Loading Resources...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-red-400 font-mono text-xs border border-red-900 bg-red-900/10 px-3 py-1.5 rounded-sm">
            ERROR: {error}
          </div>
          <Link href="/submit" className="inline-block text-zinc-500 hover:text-white transition-colors text-xs font-mono border-b border-zinc-800 hover:border-zinc-500 pb-0.5">
            Submit Stats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-zinc-300 text-sm font-sans selection:bg-cursor-blue/30 flex flex-col">
      
      {/* Top Navigation Bar / Breadcrumbs */}
      <div className="h-10 border-b border-[#2b2b2b] bg-[#1e1e1e] flex items-center px-4 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
           <Terminal className="w-3.5 h-3.5" />
           <span>cursor-wrapped</span>
           <span>/</span>
           <span className="text-zinc-300">leaderboard</span>
                </div>
                
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-2 py-1 bg-[#2b2b2b] rounded border border-[#3e3e3e] min-w-[200px]">
             <Search className="w-3 h-3 text-zinc-500" />
             <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-xs text-zinc-300 w-full placeholder-zinc-600 font-sans"
              />
           </div>
           <Link href="/submit" className="bg-cursor-blue hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5">
              <span>Submit Stats</span>
              <ArrowUpRight className="w-3 h-3" />
           </Link>
                    </div>
                  </div>

      <div className="p-0 flex-1">
        <div className="border-b border-[#2b2b2b] bg-[#18181b]">
           <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider gap-4">
              <div className="col-span-1">#</div>
              <div className="col-span-3">User</div>
              <div className="col-span-2 text-right">Tokens</div>
              <div className="col-span-1 text-right">Agents</div>
              <div className="col-span-1 text-right">Tabs</div>
              <div className="col-span-1 text-right">Streak</div>
              <div className="col-span-3 pl-4 flex justify-between items-center">
                <span>Top Models</span>
                <span className="sr-only">Screenshot</span>
              </div>
           </div>
              </div>

        <div className="divide-y divide-[#1e1e1e]">
          {filteredSubmissions.map((submission, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            
            return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                key={submission.id}
                className={cn(
                  "grid grid-cols-12 px-4 py-2.5 items-center gap-4 hover:bg-[#1e1e1e] transition-colors cursor-default group",
                  isTopThree ? "bg-[#1e1e1e]/30" : ""
                )}
              >
                <div className="col-span-1 font-mono text-xs text-zinc-500">
                  {rank}
                </div>
                
                <div className="col-span-3 flex items-center">
                   <div className="flex flex-col">
                      {submission.social_link ? (
                        <a 
                          href={submission.social_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={cn(
                            "text-sm hover:underline flex items-center gap-1.5",
                            isTopThree ? "text-white font-medium" : "text-zinc-400 group-hover:text-zinc-300"
                          )}
                        >
                          {submission.name}
                          {submission.social_provider === 'github' && <Github className="w-3 h-3 text-zinc-500" />}
                          {(submission.social_provider === 'twitter' || submission.social_provider === 'x') && (
                            <svg className="w-3 h-3 text-zinc-500 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          )}
                        </a>
                      ) : (
                        <span className={cn(
                           "text-sm",
                           isTopThree ? "text-white font-medium" : "text-zinc-400 group-hover:text-zinc-300"
                        )}>
                          {submission.name}
                          </span>
                    )}
                  </div>
                </div>

                <div className="col-span-2 text-right font-mono text-xs text-zinc-300">
                   {formatTokens(submission.tokens)}
                </div>

                <div className="col-span-1 text-right font-mono text-xs text-zinc-500">
                   {formatNumber(submission.agents)}
              </div>

                <div className="col-span-1 text-right font-mono text-xs text-zinc-500">
                   {formatNumber(submission.tabs)}
                </div>

                <div className="col-span-1 text-right font-mono text-xs text-zinc-500">
                   {submission.streak ? `${submission.streak}d` : '-'}
                </div>

                <div className="col-span-3 pl-4 flex items-center justify-between">
                   <div className="flex gap-1.5 flex-wrap">
                     {submission.top_models?.slice(0, 3).map((model) => (
                        <span key={model} className="px-1.5 py-0.5 rounded-sm bg-[#2b2b2b] border border-[#3e3e3e] text-[10px] text-zinc-400 font-mono">
                           {model}
                        </span>
                     ))}
                   </div>
                   
                   {submission.screenshot_url && (
              <button
                       onClick={() => setSelectedScreenshot(submission.screenshot_url!)}
                       className="p-1.5 rounded-sm hover:bg-[#2b2b2b] text-zinc-600 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100"
                       title="View Screenshot"
              >
                       <ImageIcon className="w-3.5 h-3.5" />
              </button>
                   )}
                </div>
              </motion.div>
            );
          })}

          {filteredSubmissions.length === 0 && (
             <div className="py-12 text-center">
                <div className="inline-block p-3 rounded-full bg-[#1e1e1e] mb-3">
                   <Filter className="w-5 h-5 text-zinc-600" />
                            </div>
                <p className="text-zinc-500 text-sm">No results found matching "{searchTerm}"</p>
                          </div>
                        )}
                      </div>
                    </div>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScreenshot(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-12"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-full bg-[#1e1e1e] border border-[#2b2b2b] rounded-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b border-[#2b2b2b] bg-[#1e1e1e]">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>screenshot.png</span>
                </div>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-1 rounded-sm hover:bg-[#2b2b2b] text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#111111]">
                <img 
                  src={selectedScreenshot} 
                  alt="Submission Screenshot" 
                  className="max-w-full max-h-[80vh] object-contain rounded-sm border border-[#2b2b2b]"
                />
                </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      <footer className="py-8 px-6 text-center text-[10px] text-zinc-600 border-t border-zinc-800/50 mt-auto">
        <div className="space-y-1">
          <p>
            Built with ❤️ using Cursor by{' '}
            <a href="https://x.com/dropoutsanta" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@dropoutsanta</a>
            {' & '}
            <a href="https://x.com/evahteev" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@evahteev</a>
          </p>
          <p className="text-zinc-700">
            Not affiliated with Cursor or Anysphere.{' '}
            <a href="/privacy" className="hover:text-zinc-500">Privacy</a>
            {' · '}
            <a href="/terms" className="hover:text-zinc-500">Terms</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
