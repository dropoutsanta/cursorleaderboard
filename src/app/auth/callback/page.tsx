'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientBrowser } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // #region agent log
    console.log('[DEBUG] AuthCallback page mounted', { url: window.location.href, search: window.location.search, hypothesisId: 'C' });
    // #endregion

    const supabase = createClientBrowser();
    
    // Listen for auth state changes - this handles the OAuth code exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // #region agent log
      console.log('[DEBUG] Auth state changed', { event, hasSession: !!session, userId: session?.user?.id, hypothesisId: 'C' });
      // #endregion

      if (event === 'SIGNED_IN' && session) {
        // Mark that we're returning from auth
        sessionStorage.setItem('authCallback', 'true');
        
        // #region agent log
        console.log('[DEBUG] User signed in, redirecting to /submit', { userId: session.user.id, hypothesisId: 'C' });
        // #endregion

        // Redirect back to submit page to continue submission
        router.push('/submit');
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // Ignore these events
      }
    });

    // Also check if already signed in (in case the event already fired)
    const checkExistingSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // #region agent log
      console.log('[DEBUG] Checked existing session', { hasSession: !!session, hasError: !!error, errorMsg: error?.message, hypothesisId: 'C' });
      // #endregion

      if (error) {
        console.error('Auth callback error:', error);
        router.push('/submit');
        return;
      }
      
      if (session) {
        // Already have a session, redirect
        sessionStorage.setItem('authCallback', 'true');
        // #region agent log
        console.log('[DEBUG] Found existing session, redirecting to /submit', { userId: session.user.id, hypothesisId: 'C' });
        // #endregion
        router.push('/submit');
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
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

