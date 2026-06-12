/**
 * Installation and setup instructions for `@neoflo/atoms`.
 *
 * This module is the single source of truth for "how do I install / set up
 * the design system" content. It is:
 *   - serialized to `data/installation.json` by `scripts/generate.ts`
 *     (consumed by the MCP `get_installation` tool), and
 *   - rendered by the docs site installation page.
 *
 * Keep it framework-aware: the same package installs into Next.js and plain
 * React (Vite/CRA) apps, with a different provider wiring step for each.
 */

export type InstallFramework = 'nextjs' | 'react';

export type CodeLanguage = 'bash' | 'ts' | 'tsx' | 'json';

export interface InstallStep {
  title: string;
  body: string;
  code?: string;
  language?: CodeLanguage;
}

export interface FrameworkSetup {
  id: InstallFramework;
  label: string;
  summary: string;
  steps: InstallStep[];
}

export interface InstallationGuide {
  packageName: string;
  repo: string;
  /** Steps shared by every framework (install + version pinning). */
  shared: InstallStep[];
  /** Per-framework provider wiring + usage. */
  frameworks: FrameworkSetup[];
  /** Import-surface and dependency rules that apply everywhere. */
  notes: string[];
}

const INSTALL_COMMAND =
  'npm install git+ssh://git@github.com/neofloai/atoms.git';

const SHARED_STEPS: InstallStep[] = [
  {
    title: 'Install from the private GitHub repo',
    body: '@neoflo/atoms is distributed over git (not the public npm registry). With an SSH key that has read access to neofloai/atoms, run:',
    code: INSTALL_COMMAND,
    language: 'bash',
  },
  {
    title: 'Pin a version for production',
    body: 'A bare install tracks the default branch. Pin to a tag or commit for reproducible builds:',
    code: 'npm install git+ssh://git@github.com/neofloai/atoms.git#v0.1.0',
    language: 'bash',
  },
];

const NEXTJS_SETUP: FrameworkSetup = {
  id: 'nextjs',
  label: 'Next.js (App Router)',
  summary:
    'Wrap the root layout once. No transpilePackages or bundler config needed.',
  steps: [
    {
      title: 'Wrap the root layout in NeofloThemeProvider',
      body: 'NeofloThemeProvider applies the Neoflo MUI theme, CssBaseline, and Phosphor icon defaults. It is a client component and can be rendered directly inside your server layout.',
      code: `// app/layout.tsx
import { NeofloThemeProvider } from '@neoflo/atoms';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NeofloThemeProvider>{children}</NeofloThemeProvider>
      </body>
    </html>
  );
}`,
      language: 'tsx',
    },
    {
      title: 'Import and use components',
      body: 'Import the Neoflo API from the package root:',
      code: `import { Button, TextField } from '@neoflo/atoms';`,
      language: 'tsx',
    },
    {
      title: 'Optional: pin the color scheme',
      body: 'By default the theme follows the OS color scheme. If your UI is designed for a single scheme, pin it with the defaultMode prop:',
      code: `<NeofloThemeProvider defaultMode="light">{children}</NeofloThemeProvider>`,
      language: 'tsx',
    },
    {
      title: 'Optional: flicker-free SSR styles',
      body: 'For server-rendered apps, wrap NeofloThemeProvider with the MUI AppRouterCacheProvider so Emotion styles are inserted during streaming. Install @mui/material-nextjs and @emotion/cache, then:',
      code: `// app/layout.tsx
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { NeofloThemeProvider } from '@neoflo/atoms';

// ...inside <body>
<AppRouterCacheProvider options={{ enableCssLayer: true }}>
  <NeofloThemeProvider>{children}</NeofloThemeProvider>
</AppRouterCacheProvider>`,
      language: 'tsx',
    },
  ],
};

const REACT_SETUP: FrameworkSetup = {
  id: 'react',
  label: 'React (Vite / CRA)',
  summary: 'Wrap your app entry once. No bundler config needed.',
  steps: [
    {
      title: 'Wrap your app entry in NeofloThemeProvider',
      body: 'Add the provider once at the root so every component inherits the theme and icon defaults.',
      code: `// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NeofloThemeProvider } from '@neoflo/atoms';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NeofloThemeProvider>
      <App />
    </NeofloThemeProvider>
  </StrictMode>,
);`,
      language: 'tsx',
    },
    {
      title: 'Import and use components',
      body: 'Import the Neoflo API from the package root:',
      code: `import { Button, TextField } from '@neoflo/atoms';`,
      language: 'tsx',
    },
    {
      title: 'Optional: pin the color scheme',
      body: 'By default the theme follows the OS color scheme. If your UI is designed for a single scheme, pin it with the defaultMode prop:',
      code: `<NeofloThemeProvider defaultMode="light">
  <App />
</NeofloThemeProvider>`,
      language: 'tsx',
    },
  ],
};

export const installation: InstallationGuide = {
  packageName: '@neoflo/atoms',
  repo: 'neofloai/atoms',
  shared: SHARED_STEPS,
  frameworks: [NEXTJS_SETUP, REACT_SETUP],
  notes: [
    'Import only from @neoflo/atoms, @neoflo/atoms/icons, @neoflo/atoms/tokens, and @neoflo/atoms/theme.',
    'Do not import from @mui/material directly -- it bypasses the design system.',
    'react and react-dom are peer dependencies: your app provides them (React 18 or 19). MUI and Emotion ship inside the package, so you do not install them.',
    'The package ships compiled JavaScript (dist/), so no transpilePackages or bundler transpile config is required.',
    'Brand fonts (Plus Jakarta Sans and Instrument Serif) are self-hosted and loaded automatically by NeofloThemeProvider -- you do not need to add Google Fonts links or next/font wiring.',
    'Color scheme follows the OS by default. Pin it with NeofloThemeProvider\'s defaultMode prop ("light", "dark", or "system") when your UI is designed for a single scheme.',
  ],
};

/**
 * Returns the setup steps for a given framework, or null if unknown.
 */
export function getFrameworkSetup(
  framework: InstallFramework
): FrameworkSetup | null {
  return installation.frameworks.find((f) => f.id === framework) ?? null;
}
