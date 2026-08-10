import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata = {
  title: 'Installation — Atoms',
  description:
    'Install @neoflo/atoms from the private GitHub repository and set up the theme provider in a Next.js or React app.',
};

const sshInstall = `npm install git+ssh://git@github.com/neofloai/atoms.git`;

const pinnedInstall = `# Pin to a branch
npm install git+ssh://git@github.com/neofloai/atoms.git#main

# Pin to a tag (recommended for production)
npm install git+ssh://git@github.com/neofloai/atoms.git#v1.0.0

# Pin to an exact commit
npm install git+ssh://git@github.com/neofloai/atoms.git#1a2b3c4`;

const httpsInstall = `npm install git+https://github.com/neofloai/atoms.git`;

const ciToken = `git config --global \\
  url."https://\${GITHUB_TOKEN}@github.com/".insteadOf \\
  "https://github.com/"

npm install git+https://github.com/neofloai/atoms.git`;

const nextProviderSetup = `// app/layout.tsx
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
}`;

const reactProviderSetup = `// src/main.tsx
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
);`;

const nextSsrCache = `// app/layout.tsx — optional, flicker-free SSR styles
// npm install @mui/material-nextjs @emotion/cache
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { NeofloThemeProvider } from '@neoflo/atoms';

// ...inside <body>
<AppRouterCacheProvider options={{ enableCssLayer: true }}>
  <NeofloThemeProvider>{children}</NeofloThemeProvider>
</AppRouterCacheProvider>`;

const colorModeSetup = `// Follows the OS color scheme by default.
// Pin it when your UI is designed for a single scheme:
<NeofloThemeProvider defaultMode="light">
  {children}
</NeofloThemeProvider>`;

const usageExample = `import { neofloTheme } from '@neoflo/atoms';
import { spacing, colors } from '@neoflo/atoms/tokens';
import { ShieldCheckIcon } from '@neoflo/atoms/icons';`;

function CodeBlock({ children }: { children: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1.5,
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: 13,
        bgcolor: 'action.hover',
        whiteSpace: 'pre',
        overflowX: 'auto',
      }}
    >
      {children}
    </Paper>
  );
}

CodeBlock.displayName = 'CodeBlock';

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
            <code>@neoflo/atoms</code> lives in a private GitHub repository
            (<code>neofloai/atoms</code>) and is installed straight from git —
            it is not published to the public npm registry. Anyone with read
            access to the repo can install it.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Requirements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atoms works in any React 18 or 19 app — Next.js (App Router),
              Vite, or CRA. <code>react</code> and <code>react-dom</code> are
              peer dependencies your app already provides; MUI v9, Emotion, and
              the brand fonts (DM Sans + Instrument Serif) ship inside
              the package, so you do not install or load them separately. The
              package ships compiled JavaScript, so no bundler transpile config
              is needed.
            </Typography>
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              1. Install from GitHub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If your machine has an SSH key linked to a GitHub account with
              access to <code>neofloai/atoms</code>, this is all you need:
            </Typography>
          </Stack>
          <CodeBlock>{sshInstall}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            By default this installs from the default branch. For
            reproducible builds, pin to a tag or commit:
          </Typography>
          <CodeBlock>{pinnedInstall}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Prefer HTTPS? This works too, using your cached git credentials
            (or a personal access token when prompted):
          </Typography>
          <CodeBlock>{httpsInstall}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              2. CI and Docker builds
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Build machines have no SSH key, so authenticate with a
              fine-grained personal access token (read-only access to the
              repo is enough). Rewrite GitHub URLs to include the token
              before <code>npm install</code> runs:
            </Typography>
          </Stack>
          <CodeBlock>{ciToken}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Store the token as a CI secret (for example{' '}
            <code>GITHUB_TOKEN</code> in GitHub Actions). Never commit it to
            the repository or a lockfile.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              3. Wrap your app in the theme provider
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <code>NeofloThemeProvider</code> applies the Neoflo MUI theme
              (light and dark), the CSS baseline, and Phosphor icon defaults
              in one wrapper. It is framework-agnostic — add it once at the
              root of your app.
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
          <Typography variant="body2" color="text.secondary">
            For server-rendered Next.js apps, you can optionally wrap{' '}
            <code>NeofloThemeProvider</code> with the MUI{' '}
            <code>AppRouterCacheProvider</code> to insert Emotion styles during
            streaming (avoids a flash of unstyled content):
          </Typography>
          <CodeBlock>{nextSsrCache}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            The theme follows the OS color scheme by default. If your UI is
            designed for a single scheme, pin it with the{' '}
            <code>defaultMode</code> prop (<code>&quot;light&quot;</code>,{' '}
            <code>&quot;dark&quot;</code>, or <code>&quot;system&quot;</code>):
          </Typography>
          <CodeBlock>{colorModeSetup}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              4. Import and build
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Everything is exposed through the package root and three
              subpaths — components from the root, tokens, the theme object,
              and tree-shakable icons:
            </Typography>
          </Stack>
          <CodeBlock>{usageExample}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Import only from these entry points. Reaching into{' '}
            <code>@mui/material</code> directly bypasses the design system
            and is not supported.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Updating
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Git installs are locked to the commit recorded in{' '}
            <code>package-lock.json</code>. To pull a newer version, re-run
            the install command with the new tag (or run{' '}
            <code>npm update @neoflo/atoms</code> when tracking a branch).
            Pair the upgrade with the MCP endpoint so your AI editor always
            codes against the version you have installed.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
