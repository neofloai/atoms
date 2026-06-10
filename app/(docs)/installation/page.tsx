import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata = {
  title: 'Installation — Atoms',
  description:
    'Install @neoflo/atoms from the private GitHub repository and set up the theme provider in your Next.js app.',
};

const sshInstall = `npm install git+ssh://git@github.com/neofloai/atoms.git`;

const pinnedInstall = `# Pin to a branch
npm install git+ssh://git@github.com/neofloai/atoms.git#main

# Pin to a tag (recommended for production)
npm install git+ssh://git@github.com/neofloai/atoms.git#v0.1.0

# Pin to an exact commit
npm install git+ssh://git@github.com/neofloai/atoms.git#1a2b3c4`;

const httpsInstall = `npm install git+https://github.com/neofloai/atoms.git`;

const ciToken = `git config --global \\
  url."https://\${GITHUB_TOKEN}@github.com/".insteadOf \\
  "https://github.com/"

npm install git+https://github.com/neofloai/atoms.git`;

const transpileConfig = `// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@neoflo/atoms'],
};

export default nextConfig;`;

const providerSetup = `// app/layout.tsx
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

const usageExample = `import { neofloTheme } from '@neoflo/atoms';
import { spacing, colors } from '@neoflo/atoms/tokens';
import { ShieldCheck } from '@neoflo/atoms/icons';`;

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
              Your app must be on the same stack the design system targets:
              Next.js 16 (App Router), React 19, and TypeScript 5. MUI v9 and
              Emotion are installed automatically as dependencies of the
              package.
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
              3. Transpile the package
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The package ships TypeScript source, not pre-built JavaScript.
              Tell Next.js to compile it as part of your app build:
            </Typography>
          </Stack>
          <CodeBlock>{transpileConfig}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              4. Wrap your app in the theme provider
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <code>NeofloThemeProvider</code> sets up the Emotion SSR cache,
              the Neoflo MUI theme (light and dark), the CSS baseline, and
              icon defaults in one wrapper. Add it to your root layout:
            </Typography>
          </Stack>
          <CodeBlock>{providerSetup}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              5. Import and build
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
