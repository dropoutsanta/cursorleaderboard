'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Command, ArrowRight, Loader2, CheckCircle2, AlertCircle, FileImage, Sparkles, ScanLine, Zap, Layers, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientBrowser } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function SubmitPage() {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState<'upload' | 'auth' | 'scanning' | 'success'>('upload');
  const [rank, setRank] = useState<number | null>(null);
  const [scanData, setScanData] = useState<any>(null);
  
  const supabase = createClientBrowser();

  // Helper to convert data URL to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);

      // Check if returning from auth callback
      const isAuthCallback = sessionStorage.getItem('authCallback');
      const pendingScreenshot = sessionStorage.getItem('pendingScreenshot');
      const pendingName = sessionStorage.getItem('pendingScreenshotName');

      if (isAuthCallback && pendingScreenshot && user) {
        // Clear the flags
        sessionStorage.removeItem('authCallback');
        sessionStorage.removeItem('pendingScreenshot');
        sessionStorage.removeItem('pendingScreenshotName');

        // Restore screenshot state
        setPreview(pendingScreenshot);
        const file = dataURLtoFile(pendingScreenshot, pendingName || 'screenshot.png');
        setScreenshot(file);

        // Auto-submit
        handleSubmitAfterAuth(user, file);
      } else if (isAuthCallback) {
        // Clear flag if no pending data
        sessionStorage.removeItem('authCallback');
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleContinueToAuth = () => {
    if (!screenshot) {
      setError('Screenshot required');
      return;
    }
    setStep('auth');
  };

  const signInWithProvider = async (provider: 'github') => {
    setError(null);
    try {
      // Save screenshot to sessionStorage before redirecting
      if (preview) {
        sessionStorage.setItem('pendingScreenshot', preview);
        sessionStorage.setItem('pendingScreenshotName', screenshot?.name || 'screenshot.png');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleSubmitAfterAuth = async (authUser: User, fileToUpload: File) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', authUser.user_metadata?.user_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Anonymous');
      formData.append('screenshot', fileToUpload);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setRank(data.rank);
      setScanData(data.extracted);
      setStep('scanning');
      
      // Delay to show scanning animation before showing success/rank
      setTimeout(() => {
        setStep('success');
        setSuccess(true);
      }, 4000);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!screenshot) {
      setError('Screenshot required');
      return;
    }

    if (user) {
      await handleSubmitAfterAuth(user, screenshot);
    } else {
      handleContinueToAuth();
    }
  };

  const handleShare = () => {
    const text = `I just ranked #${rank} on the Cursor Leaderboard! Check out my 2025 Wrapped stats:`;
    const url = window.location.origin;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-cursor-blue/30 flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-white opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cursor-blue/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-md p-6">
        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center space-y-8 py-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 mb-4 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <h2 className="text-3xl font-light tracking-tight text-white">Submission Successful</h2>
                
                {rank && (
                  <div className="py-6 px-8 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Your Global Rank</p>
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 font-mono">
                      #{rank}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full py-3.5 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-black hover:bg-zinc-900 text-white border border-zinc-800 shadow-lg shadow-zinc-900/20"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Share Ranking</span>
                </button>

                <a
                  href="/"
                  className="block w-full py-3.5 px-4 rounded-xl font-medium transition-all duration-300 text-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                >
                  View Leaderboard
                </a>
              </div>
            </motion.div>
          ) : step === 'scanning' ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full relative"
            >
              <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                {preview && <img src={preview} alt="Scanning" className="w-full h-auto opacity-50 grayscale" />}
                
                {/* Scanning Laser */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-cursor-blue shadow-[0_0_20px_rgba(55,153,255,0.8)] z-10"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-b from-cursor-blue/10 to-transparent pointer-events-none" />
                
                {/* Stats Populating Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                  <div className="w-full max-w-xs space-y-4 p-4">
                    {scanData && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center justify-between border-b border-white/10 pb-2"
                        >
                          <span className="text-zinc-400 font-mono text-xs flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-cursor-blue" /> TOKENS
                          </span>
                          <span className="text-white font-mono font-bold text-lg">{scanData.tokens}</span>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 }}
                          className="flex items-center justify-between border-b border-white/10 pb-2"
                        >
                          <span className="text-zinc-400 font-mono text-xs flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-400" /> AGENTS
                          </span>
                          <span className="text-white font-mono font-bold text-lg">{scanData.agents || '-'}</span>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.9 }}
                          className="flex items-center justify-between border-b border-white/10 pb-2"
                        >
                           <span className="text-zinc-400 font-mono text-xs flex items-center gap-2">
                            <Layers className="w-3 h-3 text-purple-400" /> TABS
                          </span>
                          <span className="text-white font-mono font-bold text-lg">{scanData.tabs || '-'}</span>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 2.8 }}
                          className="pt-4 text-center"
                        >
                           <div className="text-xs text-cursor-blue font-mono mb-1 animate-pulse">VERIFIED AUTHENTIC</div>
                           <div className="text-xs text-zinc-500 font-mono">CALCULATING RANK...</div>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : step === 'auth' ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-4">
                  <Sparkles className="w-3 h-3" />
                  <span>Step 2 of 2</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                  Sign in to Publish
                </h1>
                <p className="text-zinc-500 font-light text-sm">Choose how you want to appear on the leaderboard</p>
              </div>

              {isSubmitting ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                  <span className="text-zinc-400 font-mono text-sm">Processing your stats...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => signInWithProvider('github')}
                    className="w-full py-3.5 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#2f363d] text-white border border-white/10"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-mono justify-center"
                  >
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setStep('upload')}
                className="w-full text-center text-zinc-600 hover:text-white transition-colors text-sm font-mono"
              >
                ← Back
              </button>

              <p className="text-center text-[10px] text-zinc-600 pt-2">
                By continuing, you agree to our{' '}
                <a href="/terms" className="underline hover:text-zinc-400">Terms</a>
                {' '}and{' '}
                <a href="/privacy" className="underline hover:text-zinc-400">Privacy Policy</a>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-4">
                  <Sparkles className="w-3 h-3" />
                  <span>2025 Wrapped</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                  CursorScore
                </h1>
                <p className="text-zinc-500 font-light text-sm">Upload your Cursor Wrapped to join the leaderboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={cn(
                        "relative group cursor-pointer transition-all duration-300 rounded-xl border border-dashed overflow-hidden min-h-[200px] flex items-center justify-center",
                        isDragging
                          ? "border-cursor-blue bg-cursor-blue/5 scale-[1.02]"
                          : preview
                          ? "border-white/20 bg-white/5"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                      )}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                      />
                      
                      <div className="p-6 text-center w-full">
                        {preview ? (
                          <div className="relative w-full">
                            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mb-3 font-mono">
                              <FileImage className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{screenshot?.name}</span>
                            </div>
                            <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg mx-auto max-w-[200px]">
                              <img src={preview} alt="Preview" className="w-full h-auto object-cover opacity-90" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                              <Upload className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-300 font-medium">Upload your Cursor Wrapped</p>
                              <p className="text-xs text-zinc-600 mt-1 font-mono">Drag & drop or click to browse</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-mono justify-center"
                    >
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!screenshot}
                  className={cn(
                    "w-full py-3.5 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group text-sm",
                    !screenshot
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-white text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99]"
                  )}
                >
                  <span>{user ? 'Submit Stats' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-center pt-2">
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 text-[10px] text-zinc-600 hover:text-white transition-colors font-mono uppercase tracking-wider"
                  >
                    <Command className="w-3 h-3" />
                    <span>View Leaderboard</span>
                  </a>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 text-center text-[10px] text-zinc-600 bg-gradient-to-t from-black to-transparent">
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

