import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { UserStatus } from "@/components/UserStatus";
import { HelpButton } from "@/components/HelpButton";
import { BottomNav } from "@/components/BottomNav";
import { PWAInstaller } from "@/components/PWAInstaller";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://spinthejar.com'),
  title: {
    default: "Spin the Jar | The Ultimate Decision Maker",
    template: "%s | Spin the Jar",
  },
  description: "Stop asking \"what should we do?\" Spin the jar for ideas, sync with friends, and decide together. Perfect for groups, families, and solo decisions.",
  keywords: [
    "decision maker", "random picker", "group activities", "what to do", "idea generator",
    "social planner", "activity picker", "choice maker", "randomizer", "community jars",
    "social decision making", "public groups", "date night generator", "how to decide what to do",
    "couple activities app", "friends hangout ideas", "weekend itinerary planner"
  ],
  authors: [{ name: "Spin the Jar Team" }],
  creator: "Spin the Jar",
  applicationName: "Spin the Jar",
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-id", // Placeholder
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://spinthejar.com",
    title: "Spin the Jar | Make Decisions Together",
    description: "Stop asking 'What do you want to do?'. Let Spin the Jar decide.",
    siteName: "Spin the Jar",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Spin the Jar Preview',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spin the Jar | Make Decisions Together",
    description: "A fun way for friends and families to decide what to do.",
    images: ['/opengraph-image.png'],
  },
  category: "lifestyle",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Spin the Jar",
  "url": "https://spinthejar.com",
  "logo": "https://spinthejar.com/icon.png",
  "sameAs": [
    "https://twitter.com/spinthejar"
  ]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// PWA Manifest and Icons
export const manifest = {
  themeColor: '#ec4899',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Spin the Jar',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Spin the Jar" />

        {/* Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Windows */}
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <PWAInstaller />
        <InstallPrompt />
        <BottomNav />
        <UserStatus />
        <HelpButton />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
