import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import NextLink from '@/app/_lib/Link';

import { CodeBlock } from '../_components/CodeBlock';

/**
 * Deliberately short — just enough to install and use Atoms in a project.
 * The full reference (CI/CD, Docker, AWS deployment, every import/theming
 * rule, update semantics) lives in src/install/index.ts, served through
 * the MCP endpoint for AI editors. This page and that source are not meant
 * to match line-for-line: this one is the quick-start, that one is the
 * exhaustive one.
 */
export const metadata = {
  title: 'Installation — Atoms',
  description:
    'Install @neofloai/atoms from GitHub Packages and set up the theme provider in a Next.js or React app.',
};

const npmrcSnippet = `@neofloai:registry=https://npm.pkg.github.com`;

const ghAuthSnippet = `gh auth refresh -h github.com -s read:packages
npm config set //npm.pkg.github.com/:_authToken "$(gh auth token)" --location=global`;

const tokenSnippet = `npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN --location=global`;

const installCommand = `npm install @neofloai/atoms@^1.0.0`;

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

const deploymentNpmrc = `@neofloai:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}`;

const deploymentGhActions = `# job needs: permissions: { packages: read }
env:
  NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

const deploymentDocker = `RUN --mount=type=secret,id=npm_token \\
  NODE_AUTH_TOKEN=$(cat /run/secrets/npm_token) npm ci --ignore-scripts`;

const deploymentCodeBuild = `# store NODE_AUTH_TOKEN in Secrets Manager; grant the service role
# secretsmanager:GetSecretValue
DOCKER_BUILDKIT=1 docker build --secret id=npm_token,env=NODE_AUTH_TOKEN -t $REPOSITORY_URI:latest .`;

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
            <code>@neofloai/atoms</code> is published to{' '}
            <strong>GitHub Packages</strong> — a private registry. This is a
            Neoflo-internal package: only engineers in the{' '}
            <code>neofloai</code> GitHub org with read access granted on the
            package can install it. Works in any React 18 or 19 app —
            Next.js, Vite, or CRA.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              1. Authenticate
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add this to your project&apos;s <code>.npmrc</code> (safe to
              commit — no token in it):
            </Typography>
          </Stack>
          <CodeBlock>{npmrcSnippet}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Then, <strong>once per machine, ever</strong> — covers every{' '}
            <code>@neofloai</code> package, not just this one. If you have
            the{' '}
            <Link href="https://cli.github.com/" target="_blank" rel="noreferrer">
              gh CLI
            </Link>{' '}
            authenticated already, there&apos;s no token to create by hand:
          </Typography>
          <CodeBlock>{ghAuthSnippet}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            No <code>gh</code> CLI? Create a token scoped to{' '}
            <code>read:packages</code> only (
            <Link
              href="https://github.com/settings/tokens/new?scopes=read:packages&description=neofloai-npm"
              target="_blank"
              rel="noreferrer"
            >
              github.com/settings/tokens/new
            </Link>
            ), then:
          </Typography>
          <CodeBlock>{tokenSnippet}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              2. Install
            </Typography>
          </Stack>
          <CodeBlock>{installCommand}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              3. Wrap your app in the theme provider
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
              4. Import and use
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
              Two things to add to your project so your CI/CD and Docker
              builds can install <code>@neofloai/atoms</code> too.
            </Typography>
          </Stack>

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            1. Add a <code>.npmrc</code> file to your project root, and
            commit it
          </Typography>
          <CodeBlock>{deploymentNpmrc}</CodeBlock>

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            2. Give your build the token — pick whichever you use
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>GitHub Actions</strong>: add this to the workflow step
            that runs <code>npm ci</code>:
          </Typography>
          <CodeBlock>{deploymentGhActions}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            <strong>Dockerfile</strong>: add this line where you currently
            run <code>npm ci</code>:
          </Typography>
          <CodeBlock>{deploymentDocker}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            <strong>AWS CodeBuild</strong>: add this to{' '}
            <code>buildspec.yml</code> (needs a one-time setup: store the
            token in Secrets Manager, grant the CodeBuild role{' '}
            <code>secretsmanager:GetSecretValue</code>):
          </Typography>
          <CodeBlock>{deploymentCodeBuild}</CodeBlock>

          <Typography variant="body2" color="text.secondary">
            That&apos;s it — nothing else changes. The running container
            itself needs none of this; by the time it exists,{' '}
            <code>@neofloai/atoms</code> is already installed.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Need more?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updating to a new version and the full rule set (import
            boundaries, theming, escape hatches) live in the MCP reference —
            connect your AI editor to it (see the{' '}
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
