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

const INSTALL_COMMAND = 'npm install @neofloai/atoms@^1.0.0';

const SHARED_STEPS: InstallStep[] = [
  {
    title: 'Point the @neofloai scope at GitHub Packages',
    body: '@neofloai/atoms is published to GitHub Packages, not the public npm registry. Add this to your project\'s .npmrc (safe to commit -- it has no token in it):',
    code: '@neofloai:registry=https://npm.pkg.github.com',
    language: 'bash',
  },
  {
    title: 'Authenticate once, on this machine, ever',
    body: 'This is a Neoflo-internal package: only engineers in the neofloai GitHub org with read access granted on the package can install it. If you have the gh CLI authenticated (you likely already do), this covers every @neofloai package forever -- no token to create by hand:',
    code: `gh auth refresh -h github.com -s read:packages
npm config set //npm.pkg.github.com/:_authToken "$(gh auth token)" --location=global`,
    language: 'bash',
  },
  {
    title: "Don't have the gh CLI?",
    body: 'Create a classic personal access token scoped to read:packages only (github.com/settings/tokens/new?scopes=read:packages), then run:',
    code: 'npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN --location=global',
    language: 'bash',
  },
  {
    title: 'Install the package',
    body: 'Use a semver range so patch and minor releases apply on your next install. The committed package-lock.json still pins the exact resolved version for reproducible builds.',
    code: INSTALL_COMMAND,
    language: 'bash',
  },
  {
    title: 'CI and Docker builds',
    body: 'CI runners and Docker containers cannot read your ~/.npmrc, so the same read:packages token from the earlier step has to be handed to them a different way: as one environment variable, NODE_AUTH_TOKEN. That name is the only thing that matters -- every environment below just gets that one value into that one variable by a different route. Commit the .npmrc once; ${NODE_AUTH_TOKEN} in it is a placeholder, not a value. In GitHub Actions inside the neofloai org, the job\'s built-in GITHUB_TOKEN already has read access -- route it into NODE_AUTH_TOKEN via the step\'s env: block (grant the job permissions: packages: read), no personal token needed. In a Dockerfile, the value has to cross one more boundary into an isolated build container without ever being written into an image layer -- that is what the secret mount does. "npm_token" there is NOT the token; it is just BuildKit\'s internal label connecting --secret id= to --mount=...,id=. Never bake the real value into a committed .npmrc, an ARG, or an ENV -- those persist in the image\'s layer history. If deploying via AWS CodeBuild (this org\'s usual pattern -- CodeBuild building a Docker image for ECS/Fargate): store the token in AWS Secrets Manager, grant the CodeBuild service role secretsmanager:GetSecretValue on that secret, and add it as a SECRETS_MANAGER-type environment variable named NODE_AUTH_TOKEN on the CodeBuild project -- same name as above, so nothing needs renaming between CodeBuild and the Dockerfile. The running ECS/Fargate task needs none of this; by the time the image exists, @neofloai/atoms is already installed -- this is a build-time-only concern.',
    code: `# .npmrc (commit this)
@neofloai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}

# .github/workflows/*.yml -- job needs: permissions: { packages: read }
- run: npm ci
  env:
    NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}

# Dockerfile
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=npm_token \\
  NODE_AUTH_TOKEN=$(cat /run/secrets/npm_token) npm ci --ignore-scripts

# Build with -- NODE_AUTH_TOKEN is your own read:packages token,
# exported in whatever shell/CI job runs this command:
export NODE_AUTH_TOKEN=YOUR_TOKEN
docker build --secret id=npm_token,env=NODE_AUTH_TOKEN .

# buildspec.yml (build phase) -- AWS CodeBuild -> ECS/Fargate pattern.
# CodeBuild project needs: privileged mode on, and NODE_AUTH_TOKEN
# added as a Secrets Manager-type environment variable.
- DOCKER_BUILDKIT=1 docker build --secret id=npm_token,env=NODE_AUTH_TOKEN -t $REPOSITORY_URI:latest .`,
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
    'Do not call MUI\'s createTheme() or mount a second theme provider -- NeofloThemeProvider is the only theme. Style through tokens (@neofloai/atoms/tokens) or the sx prop\'s theme-aware keys (e.g. color: "primary.main"), never hardcoded hex or pixel values.',
    'Missing a variant or prop? Open a component-request or bug issue against the Atoms repo instead of locally wrapping or style-overriding the component -- local overrides drift between projects and stop tracking design system changes.',
    'npm update @neofloai/atoms (or a fresh npm install) pulls the latest version matching your semver range -- patch and minor releases apply automatically. Crossing a major version (e.g. ^1.0.0 -> ^2.0.0) is a deliberate package.json edit, since majors may contain breaking changes.',
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
