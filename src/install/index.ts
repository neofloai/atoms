/**
 * Installation and setup instructions for `@neofloai/atoms`.
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

import { ATOMS_VERSION } from '../release/version';

export type InstallFramework = 'nextjs' | 'react';

export type CodeLanguage = 'bash' | 'ts' | 'tsx' | 'json' | 'html';

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

/**
 * The install command, pinned to the current major.
 *
 * Pinned rather than bare because this string is what gets run: it is
 * step one of the installation guide and `scaffold_app` interleaves the
 * same step into every new project. A bare `npm install
 * github:neofloai/atoms` tracks the default branch, which leaves the
 * project on a version that has no name -- and a version with no name
 * cannot be checked, compared, or reported to the MCP tools that ask for
 * it. The alternatives are in the next step, for the cases that want
 * them.
 */
const INSTALL_COMMAND = `npm install github:neofloai/atoms#semver:^${ATOMS_VERSION}`;

const SHARED_STEPS: InstallStep[] = [
  {
    title: 'Install from the public GitHub repo',
    body: `neofloai/atoms is a public repository, so this needs no registry, no token, and no .npmrc. Anyone can install it. The #semver: range resolves against release tags -- ${ATOMS_VERSION} is current:`,
    code: INSTALL_COMMAND,
    language: 'bash',
  },
  {
    title: 'Pin what you install',
    body: `A bare install tracks the default branch, so the code can change under you between installs. Pin to a semver range instead and npm resolves it against the release tags. ${ATOMS_VERSION} is current; a range on the major picks up patches and minors without a package.json edit, and crossing a major stays deliberate.`,
    code: `# Recommended -- resolves against release tags
npm install github:neofloai/atoms#semver:^${ATOMS_VERSION}

# Exactly one release, nothing else
npm install github:neofloai/atoms#semver:${ATOMS_VERSION}

# A specific commit -- for reproducing a build, not for staying current
npm install github:neofloai/atoms#1a2b3c4`,
    language: 'bash',
  },
  {
    title: 'Know which version you got',
    body: 'Ask the installed tree, not your own package.json. Because this installs from a git ref, the dependency line in package.json is a ref or a range -- `github:neofloai/atoms#semver:^1.0.0`, or a bare commit SHA -- and neither is the version that ended up on disk. The number this returns is what the Atoms MCP tools want as `installedVersion`: `get_component` and `get_pattern` withhold their code examples until they know it, because code written against a version the project does not have fails at import. `check_version` compares it against the current release and lists what has shipped since.',
    code: `npm ls @neofloai/atoms --depth=0

# no npm on the path, or an unusual tree
node -p "require('./node_modules/@neofloai/atoms/package.json').version"

# or, from inside the app
import { ATOMS_VERSION } from '@neofloai/atoms';`,
    language: 'bash',
  },
  {
    title: 'CI and Docker builds',
    body: 'No tokens or secrets are involved, but a git install builds the library on whatever machine installs it, and that needs two things your build image may not have. First, a git binary: node:*-alpine and node:*-slim do not ship one, so install it. Second, npm ci must run WITHOUT --ignore-scripts -- the prepare script is what builds dist/, and skipping it produces "Cannot find module ./dist/index.mjs" at runtime. Both work fine on a developer laptop, which is why they are easy to miss until CI fails. Budget build time too: the install pulls the full dependency tree and runs a tsup build.',
    code: `# Alpine- and slim-based images have no git binary
RUN apk add --no-cache git

# Do NOT add --ignore-scripts here -- it skips the library build
RUN npm ci`,
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
import { NeofloThemeProvider } from '@neofloai/atoms';

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
      code: `import { Button, TextField } from '@neofloai/atoms';`,
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
import { NeofloThemeProvider } from '@neofloai/atoms';

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
import { NeofloThemeProvider } from '@neofloai/atoms';
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
      code: `import { Button, TextField } from '@neofloai/atoms';`,
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
  packageName: '@neofloai/atoms',
  repo: 'neofloai/atoms',
  shared: SHARED_STEPS,
  frameworks: [NEXTJS_SETUP, REACT_SETUP],
  notes: [
    'Import only from @neofloai/atoms, @neofloai/atoms/icons, @neofloai/atoms/tokens, and @neofloai/atoms/theme.',
    'Do not import from @mui/material directly -- it bypasses the design system.',
    'Never import from @neofloai/atoms/dist/* -- those are build internals, not a public API, and can change without notice.',
    '@mui/material ships as a dependency of this package, not a peer, so npm may hoist it into your app\'s own node_modules and it will resolve if you import it directly. That does not make it supported -- only the four entry points above are.',
    'react and react-dom are peer dependencies: your app provides them (React 18 or 19). MUI and Emotion ship inside the package, so you do not install them.',
    'Keep react and react-dom on the same major version across every project that installs @neofloai/atoms -- mixing versions across projects makes Atoms bugs reproduce inconsistently and harder to triage.',
    'The package ships compiled JavaScript (dist/), so no transpilePackages or bundler transpile config is required.',
    'Brand fonts (DM Sans and Instrument Serif) are self-hosted and loaded automatically by NeofloThemeProvider -- you do not need to add Google Fonts links or next/font wiring.',
    'Color scheme follows the OS by default. Pin it with NeofloThemeProvider\'s defaultMode prop ("light", "dark", or "system") when your UI is designed for a single scheme.',
    'For a switch the user can operate, import useColorScheme from @neofloai/atoms -- it returns { mode, setMode } and the provider persists the choice. You do not need @mui/material for this. Note that mode is undefined on the first render, before the stored preference has been read, so render the space rather than a guess or the control flips after hydration.',
    'Do not call MUI\'s createTheme() or mount a second theme provider -- NeofloThemeProvider is the only theme. Style through tokens (@neofloai/atoms/tokens) or the sx prop\'s theme-aware keys (e.g. color: "primary.main"), never hardcoded hex or pixel values.',
    'Missing a variant or prop? Open a component-request or bug issue against the Atoms repo instead of locally wrapping or style-overriding the component -- local overrides drift between projects and stop tracking design system changes.',
    `Atoms ${ATOMS_VERSION} is the current release. Install by range (#semver:^${ATOMS_VERSION}) rather than bare -- a bare install tracks the default branch and can change between installs without a version to explain what moved.`,
    'npm update @neofloai/atoms advances a #semver: range automatically for patch and minor releases; crossing a major (^1.0.0 -> ^2.0.0) stays a deliberate package.json edit. A commit-pinned or branch-tracking install only moves when you change the ref yourself.',
    'Read the installed version with npm ls @neofloai/atoms --depth=0, or from ATOMS_VERSION exported by the package -- never from the dependency line in your own package.json, which for a git install is a ref or a range and not a version.',
    'The changelog is on the docs site and served by the MCP check_version tool. Read it before taking a new major -- the release notes carry the migration steps, and there is nowhere else they are written down.',
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
