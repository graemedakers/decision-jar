import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { UserStatus } from "@/components/UserStatus";
import { HelpButton } from "@/components/HelpButton";
import { BottomNav } from "@/components/BottomNav";

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
    default: "Decision Jar | The Ultimate Decision Maker",
    template: "%s | Decision Jar",
  },
  description: "Stop asking \"what should we do?\" Spin the jar for ideas, sync with friends, and decide together. Perfect for groups, families, and solo decisions.",
  keywords: [
    "decision maker", "random picker", "group activities", "what to do", "idea generator",
    "social planner", "activity picker", "choice maker", "randomizer",
    "date ideas", "movie picker", "food decider", "restaurant chooser", "couple app"
  ],
  authors: [{ name: "Decision Jar Team" }],
  creator: "Decision Jar",
  applicationName: "Decision Jar",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://decision-jar.com",
    title: "Decision Jar | Make Decisions Together",
    description: "Stop asking 'What do you want to do?'. Let the Decision Jar decide.",
    siteName: "Decision Jar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decision Jar | Make Decisions Together",
    description: "A fun way for friends and families to decide what to do.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <BottomNav />
        <UserStatus />
        <HelpButton />
      </body>
    </html>
  );
}
