import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'LexaFlow - Learn English Effectively',
    template: '%s | LexaFlow',
  },
  description:
    'Master English with interactive exercises, AI-powered lessons, and personalized learning paths. Track your progress and achieve fluency.',
  keywords: [
    'learn english',
    'english learning',
    'english grammar',
    'english vocabulary',
    'language learning',
    'interactive exercises',
    'AI language learning',
  ],
  authors: [{ name: 'LexaFlow Team' }],
  creator: 'LexaFlow',
  publisher: 'LexaFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'LexaFlow - Learn English Effectively',
    description: 'Master English with interactive exercises and AI-powered lessons.',
    siteName: 'LexaFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexaFlow - Learn English Effectively',
    description: 'Master English with interactive exercises and AI-powered lessons.',
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
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.variable}>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
