import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import NextLink from '@/app/_lib/Link';
import { release } from '@/src/release';

import { CodeBlock } from '../_components/CodeBlock';

/**
 * Deliberately short — just enough to install and use Atoms in a project.
 * The full reference (every import/theming rule, update semantics, what a
 * CI image needs) lives in src/install/index.ts, served through the MCP
 * endpoint for AI editors. This page is the quick-start; that source is the
 * exhaustive one. They are not meant to match line-for-line. Version
 * numbers come from src/release so this page cannot name a stale release.
 */
export const metadata = {
  title: 'Installation — Atoms',
  description:
    'Install @neofloai/atoms straight from its public GitHub repo and set up the theme provider in a Next.js or React app.',
};

const installCommand = `npm install github:neofloai/atoms#semver:^${release.current}`;

const pinCommand = `# Recommended — resolves against release tags
npm install github:neofloai/atoms#semver:^${release.current}

# Exactly one release, nothing else
npm install github:neofloai/atoms#semver:${release.current}

# A specific commit — for reproducing a build, not for staying current
npm install github:neofloai/atoms#1a2b3c4`;

const versionCommand = `npm ls @neofloai/atoms --depth=0`;

const nextProviderSetup = `// app/layout.tsx
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
}`;

const reactProviderSetup = `// src/main.tsx
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
);`;

const usageExample = `import { Button } from '@neofloai/atoms';
import { spacing, colors } from '@neofloai/atoms/tokens';
import { ShieldCheckIcon } from '@neofloai/atoms/icons';`;

const deploymentDocker = `# Alpine- and slim-based images have no git binary
RUN apk add --no-cache git

# Do NOT add --ignore-scripts here — it skips the library build
RUN npm ci`;

export default function InstallationPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Getting started
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Installation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <code>@neofloai/atoms</code> installs straight from its public
            GitHub repo — no registry, no token, no <code>.npmrc</code>. Works
            in any React 18 or 19 app: Next.js, Vite, or CRA.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              1. Install
            </Typography>
          </Stack>
          <CodeBlock>{installCommand}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            <strong>{release.current}</strong> is the current release. The{' '}
            <code>#semver:</code> range resolves against release tags, so the
            version in your project has a name and{' '}
            <code>npm update</code> can advance it. Installing bare —{' '}
            <code>npm install github:neofloai/atoms</code> — tracks the default
            branch instead, and the code can change under you between installs:
          </Typography>
          <CodeBlock>{pinCommand}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            To find out what a project actually has, ask the installed tree
            rather than its own <code>package.json</code> — for a git install
            that dependency line is a ref or a range, not a version:
          </Typography>
          <CodeBlock>{versionCommand}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Every release and what changed in it is on the{' '}
            <Link component={NextLink} href="/changelog">
              changelog
            </Link>
            .
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              2. Wrap your app in the theme provider
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <code>NeofloThemeProvider</code> applies the Neoflo MUI theme,
              CSS baseline, and Phosphor icon defaults in one wrapper. Add it
              once at the root of your app.
            </Typography>
          </Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Next.js (App Router)
          </Typography>
          <CodeBlock>{nextProviderSetup}</CodeBlock>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            React (Vite / CRA)
          </Typography>
          <CodeBlock>{reactProviderSetup}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              3. Import and use
            </Typography>
          </Stack>
          <CodeBlock>{usageExample}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Import only from these entry points — never{' '}
            <code>@mui/material</code> directly, and never{' '}
            <code>@neofloai/atoms/dist/*</code>.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Deployment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No tokens or secrets are involved. But a git install builds the
              library on whatever machine installs it, so your build image
              needs two things it may not have:
            </Typography>
          </Stack>
          <CodeBlock>{deploymentDocker}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Both of these work fine on a developer laptop, which is why
            they&apos;re easy to miss until CI fails.{' '}
            <code>node:*-alpine</code> and <code>node:*-slim</code> ship no
            git binary, and <code>--ignore-scripts</code> skips the{' '}
            <code>prepare</code> script that builds <code>dist/</code> —
            producing <code>Cannot find module &apos;./dist/index.mjs&apos;</code>{' '}
            at runtime. Budget build time too: the install pulls a full
            dependency tree and runs a build.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Need more?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The full rule set — import boundaries, theming, escape hatches,
            update semantics — lives in the MCP reference. Connect your AI
            editor to it (see the{' '}
            <Link component={NextLink} href="/mcp-guide">
              MCP guide
            </Link>
            ) and ask it directly. Missing a variant or component? See{' '}
            <Link component={NextLink} href="/help">
              Help &amp; support
            </Link>
            .
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
