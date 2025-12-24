'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientBrowser } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClientBrowser();
      
      // Get the session from the URL hash (Supabase puts tokens there after OAuth)
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
      }
      
      // Mark that we're returning from auth
      sessionStorage.setItem('authCallback', 'true');
      
      // Redirect back to home to continue submission
      router.push('/');
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 text-sm font-mono">Completing sign in...</p>
      </div>
    </div>
  );
}

