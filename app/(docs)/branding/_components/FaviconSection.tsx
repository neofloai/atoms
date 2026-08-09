import Image from 'next/image';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { colors } from '@/src/tokens';

/**
 * The favicon set, previewed on the chrome each file is meant to be
 * seen against.
 *
 * A favicon is the one piece of the brand the theme cannot reach: it is
 * a file handed to browser chrome, so it cannot inherit `currentColor`
 * the way `NeofloLogo` does. Which mark to use is therefore a real
 * choice rather than an automatic one, and the default card below is
 * split across both backgrounds so the choice is visible rather than
 * asserted.
 *
 * `unoptimized` on each Image: the files are already tiny, and it keeps
 * this page off the Next image optimizer — and therefore off `sharp` —
 * in the standalone Docker build.
 */

const LIGHT_CHROME = colors.grey[25];
const DARK_CHROME = colors.grey[1000];

function Swatch({
  file,
  bg,
  alt,
}: {
  file: string;
  bg: string;
  alt: string;
}) {
  return (
    <Stack
      sx={{
        flex: 1,
        bgcolor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        py: 4,
      }}
    >
      <Image
        src={`/brand/${file}`}
        alt={alt}
        width={56}
        height={56}
        unoptimized
      />
      {/* 16px — the size a browser tab actually renders. */}
      <Image src={`/brand/${file}`} alt="" width={16} height={16} unoptimized />
    </Stack>
  );
}

Swatch.displayName = 'Swatch';

function Caption({
  title,
  note,
  file,
}: {
  title: string;
  note: string;
  file: string;
}) {
  return (
    <Stack spacing={0.25} sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {note}
      </Typography>
      <Link
        href={`/brand/${file}`}
        download
        variant="caption"
        sx={{ pt: 0.5, fontWeight: 600 }}
      >
        {file} ↓
      </Link>
    </Stack>
  );
}

Caption.displayName = 'Caption';

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

const nextSnippet = `// app/layout.tsx
export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/brand/favicon-dark.png', type: 'image/png' },
    ],
    apple: { url: '/brand/apple-touch-icon.png', type: 'image/png' },
  },
};`;

const htmlSnippet = `<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" type="image/png" href="/brand/favicon-dark.png">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">`;

const invertingSnippet = `// Only if you want the mark to invert with the OS scheme.
// The app/icon.png file convention cannot express \`media\`,
// so the icons have to be declared explicitly either way.
icon: [
  { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
  {
    url: '/brand/favicon-light.png',
    type: 'image/png',
    media: '(prefers-color-scheme: light)',
  },
  {
    url: '/brand/favicon-dark.png',
    type: 'image/png',
    media: '(prefers-color-scheme: dark)',
  },
],`;

export function FaviconSection() {
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Stack direction="row">
            <Swatch
              file="favicon-dark.png"
              bg={LIGHT_CHROME}
              alt="The Neoflo favicon on light browser chrome"
            />
            <Swatch
              file="favicon-dark.png"
              bg={DARK_CHROME}
              alt="The Neoflo favicon on dark browser chrome"
            />
          </Stack>
          <Caption
            title="Default"
            note="One file, both chromes — this is what Atoms uses"
            file="favicon-dark.png"
          />
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Swatch
            file="favicon-light.png"
            bg={LIGHT_CHROME}
            alt="The inverted Neoflo favicon on light browser chrome"
          />
          <Caption
            title="Inverted"
            note="Optional — light chrome only"
            file="favicon-light.png"
          />
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Swatch
            file="apple-touch-icon.png"
            bg={colors.grey[100]}
            alt="The Neoflo Apple touch icon"
          />
          <Caption
            title="Apple touch"
            note="iOS home screen"
            file="apple-touch-icon.png"
          />
        </Paper>
      </Box>

      <Typography variant="body2" color="text.secondary">
        The off-white disc is the default because it is the only one that
        survives both backgrounds: its black mark stays legible on light
        chrome, and the disc itself carries it on dark. The inverted file is
        the opposite — crisp on light chrome, invisible on dark — so it is
        worth adding only behind a{' '}
        <code>(prefers-color-scheme: light)</code> query, and only if you
        accept losing the icon entirely in a browser that ignores{' '}
        <code>media</code> on an icon link.
      </Typography>

      <Typography variant="body2" color="text.secondary">
        The Apple touch icon is a full-bleed square rather than a disc on
        purpose: iOS ignores transparency, composites onto black, and applies
        its own rounding.{' '}
        <Link href="/favicon.ico" download>
          favicon.ico
        </Link>{' '}
        is a 16/32/48px copy of the default, for the <code>/favicon.ico</code>{' '}
        path that crawlers and link unfurlers request directly.
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Download the files into your own repository and serve them from your
        own origin. Do not hotlink this site, or the URL you originally got
        them from — an icon served from somewhere you do not control
        disappears the day that origin does.
      </Typography>

      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Next.js App Router
        </Typography>
        <CodeBlock>{nextSnippet}</CodeBlock>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Plain HTML
        </Typography>
        <CodeBlock>{htmlSnippet}</CodeBlock>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          If you want the mark to invert
        </Typography>
        <CodeBlock>{invertingSnippet}</CodeBlock>
      </Stack>
    </Stack>
  );
}

FaviconSection.displayName = 'FaviconSection';
