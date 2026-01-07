import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { UserStatus } from "@/components/UserStatus";
import { HelpButton } from "@/components/HelpButton";
import { BottomNav } from "@/components/BottomNav";
import { PWAInstaller } from "@/components/PWAInstaller";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ModalProvider } from "@/components/ModalProvider";
import { Toaster } from "sonner";

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
    default: "Spin the Jar | AI Date Night Planner for Couples",
    template: "%s | Spin the Jar",
  },
  description: "Never waste 30 minutes deciding where to eat. Your AI-powered decision maker for date nights, friend hangs, and family adventures. We find perfect places, you spin to decide. No more arguments.",
  keywords: [
    "date night planner", "couples app", "AI date ideas", "what to do on a date", "date night ideas",
    "restaurant finder", "AI concierge", "decision maker for couples", "date night app", "romantic ideas",
    "couples activities", "relationship app", "dinner date ideas", "weekend date planner",
    "eliminate decision fatigue", "AI restaurant recommendations", "date planning assistant",
    "spin the jar", "random date picker", "couples decision maker"
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
    google: "google-site-verification-id", // TODO: Add your Google Site Verification ID
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://spinthejar.com",
    title: "Spin the Jar | Never Waste 30 Minutes Deciding Where to Eat",
    description: "Your AI-powered decision maker for date nights and hangouts. We find perfect places to go, you spin to decide. No more arguments. No more analysis paralysis.",
    siteName: "Spin the Jar",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Spin the Jar - AI Date Night Planner',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spin the Jar | AI Date Night Planner",
    description: "Never waste 30 minutes deciding where to eat. AI finds perfect spots, you spin to decide. No arguments!",
    images: ['/opengraph-image.png'],
    creator: "@spinthejar",
  },
  category: "lifestyle",
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
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#ec4899',
    'msapplication-config': '/browserconfig.xml',
  },
};


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Spin the Jar",
  "description": "AI-powered decision maker for date nights and hangouts. Never waste 30 minutes deciding where to eat again.",
  "url": "https://spinthejar.com",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250"
  },
  "author": {
    "@type": "Organization",
    "name": "Spin the Jar Team",
    "url": "https://spinthejar.com"
  },
  "features": [
    "AI-powered restaurant recommendations",
    "Decision maker for couples",
    "Pre-filled date night templates",
    "Social collaboration features",
    "Random idea picker"
  ]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PostHogProvider>
          <ModalProvider>
            <Toaster position="top-center" expand={true} richColors />
            {children}
            <PWAInstaller />
            <InstallPrompt />
            <BottomNav />
            <UserStatus />
            <HelpButton />
            <AnalyticsProvider />
          </ModalProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
