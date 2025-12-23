'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!screenshot) {
      setError('Please upload a screenshot');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('screenshot', screenshot);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/leaderboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-green-500/10 text-green-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-white">Submission Successful</h2>
          <p className="text-zinc-500 font-mono text-sm">Redirecting to leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-3xl font-light tracking-tighter text-white">
            Cursor <span className="text-zinc-500 font-mono">2025</span>
          </h1>
          <p className="text-sm text-zinc-500 font-mono tracking-tight">Submit your Wrapped stats</p>
        </div>

        <div className="backdrop-blur-xl bg-zinc-900/30 border border-white/5 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-zinc-500 ml-1">
                Display Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all font-light"
                placeholder="cursor_fan"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-zinc-500 ml-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all font-light"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="screenshot" className="text-xs font-mono uppercase tracking-wider text-zinc-500 ml-1">
                Wrapped Screenshot
              </label>
              <div className="relative group">
                <input
                  type="file"
                  id="screenshot"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!preview}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full px-4 py-8 border-2 border-dashed rounded-lg text-center transition-all ${
                  preview 
                    ? 'border-white/20 bg-zinc-900/50' 
                    : 'border-white/10 bg-black/20 group-hover:border-white/20 group-hover:bg-zinc-900/40'
                }`}>
                  {preview ? (
                    <div className="relative">
                      <p className="text-xs text-green-400 font-mono mb-2">✓ Image Selected</p>
                      <p className="text-xs text-zinc-500 truncate">{screenshot?.name}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl block mb-2 opacity-50">📷</span>
                      <p className="text-sm text-zinc-400">Click or Drop Image</p>
                    </div>
                  )}
                </div>
              </div>
              
              {preview && (
                <div className="mt-4 p-1 bg-white/5 rounded-lg border border-white/5">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto rounded opacity-80"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 font-mono">
                ! {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-lg font-medium transition-colors text-sm tracking-wide"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              ) : 'SUBMIT STATS'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <a
              href="/leaderboard"
              className="text-xs text-zinc-500 hover:text-white transition-colors font-mono border-b border-transparent hover:border-white pb-0.5"
            >
              VIEW LEADERBOARD
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
