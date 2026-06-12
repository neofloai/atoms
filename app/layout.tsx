import type { Metadata } from 'next';
import { Geist_Mono, Instrument_Serif, Plus_Jakarta_Sans } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { NeofloThemeProvider } from '@/src/theme/ThemeProvider';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Atoms — Neoflo Design System',
  description:
    'Neoflo Atoms: branded React components, design tokens, and an MCP endpoint for AI editors.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <InitColorSchemeScript attribute="data" defaultMode="system" />
        {/* AppRouterCacheProvider keeps Emotion SSR caching for the Next docs
            site. It lives here (not in NeofloThemeProvider) so the shared
            library provider stays framework-agnostic. */}
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <NeofloThemeProvider>{children}</NeofloThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
