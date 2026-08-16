import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { NeofloThemeProvider } from '@/src/theme/ThemeProvider';
import './globals.css';

// DM Sans and Instrument Serif are self-hosted by the library
// (`@fontsource`, loaded inside NeofloThemeProvider), so the docs site renders
// exactly what consumers get -- no separate next/font wiring for the brand
// fonts. Geist Mono stays here for code blocks only.
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Atoms — Neoflo Design System',
  description:
    'Neoflo Atoms: branded React components, design tokens, and an MCP endpoint for AI editors.',
  // Atoms is internal, so every page opts out of indexing. This repeats
  // the `X-Robots-Tag` header set in `next.config.ts` on purpose: the
  // header is the one that covers assets and API responses, and this tag
  // is the one that survives the HTML being saved, proxied, or mirrored
  // somewhere the header is not. Whichever a crawler reads, it gets the
  // same answer. Page-level `metadata` exports only set title and
  // description, so nothing overrides this.
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
    notranslate: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-snippet': 0,
      'max-image-preview': 'none',
      'max-video-preview': 0,
    },
  },
  // One icon, not a `media` pair. The off-white disc is the only mark
  // that survives both backgrounds: its black N stays legible on light
  // browser chrome, and the disc itself carries it on dark. The dark
  // disc is the opposite — crisp on light chrome, invisible on dark —
  // so scoping it to `(prefers-color-scheme: light)` buys a slightly
  // better light tab at the cost of losing the icon entirely in any
  // browser that ignores `media` on an icon link. Both files still ship
  // under /brand for anyone who wants the inverting pair; see /branding.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/brand/favicon-dark.png', type: 'image/png', sizes: '379x381' },
    ],
    apple: { url: '/brand/apple-touch-icon.png', type: 'image/png' },
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={geistMono.variable}
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
