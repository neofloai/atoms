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
