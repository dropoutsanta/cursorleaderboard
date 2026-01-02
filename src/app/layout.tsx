import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CursorScore - Cursor 2025 Wrapped Leaderboard",
  description: "See where you rank on the Cursor 2025 Leaderboard",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "CursorScore - Cursor 2025 Wrapped Leaderboard",
    description: "See where you rank on the Cursor 2025 Leaderboard",
    images: [
      {
        url: "/cursorscore_social.png",
        width: 1080,
        height: 1080,
        alt: "CursorScore Leaderboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CursorScore - Cursor 2025 Wrapped Leaderboard",
    description: "See where you rank on the Cursor 2025 Leaderboard",
    images: ["/cursorscore_social.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
