import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import LeaderboardClient from './LeaderboardClient';

async function getUserSubmission(userName: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('id, name, tokens')
    .eq('name', userName)
    .single();

  if (error || !data) {
    return null;
  }

  // Get rank
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('id, tokens')
    .order('tokens', { ascending: false });

  if (!allSubmissions) return null;

  const rank = allSubmissions.findIndex((s) => s.id === data.id) + 1;
  const totalUsers = allSubmissions.length;

  return {
    ...data,
    rank,
    totalUsers,
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const userName = params?.user;

  if (!userName) {
    return {
      title: 'Cursor Wrapped Leaderboard',
      description: 'Compare your Cursor 2025 Wrapped stats with others on Cursor Wrapped',
      openGraph: {
        title: 'Cursor Wrapped Leaderboard',
        description: 'Compare your Cursor 2025 Wrapped stats with others',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Cursor Wrapped Leaderboard',
        description: 'Compare your Cursor 2025 Wrapped stats with others',
      },
    };
  }

  const userData = await getUserSubmission(userName);

  if (!userData) {
    return {
      title: 'Cursor Wrapped Leaderboard',
      description: 'Compare your Cursor 2025 Wrapped stats with others on Cursor Wrapped',
    };
  }

  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cursorwrapped.com'}/api/og/${userData.id}`;
  const title = `${userData.name} is #${userData.rank} on Cursor Wrapped`;
  const description = `${userData.name} ranks #${userData.rank} out of ${userData.totalUsers} users with ${formatTokens(userData.tokens)} tokens used. See where you rank!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${userData.name}'s Cursor Wrapped rank card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
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

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;
  const initialUser = params?.user;

  return <LeaderboardClient initialUser={initialUser} />;
}
