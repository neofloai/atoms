import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from '@/app/_lib/Link';

import { patterns } from '@/src/patterns';

import type { PatternExamplesData } from '@/src/types/docs';

export const metadata = {
  title: 'Patterns — Atoms',
  description:
    'Whole screens composed from Atoms components — the invoice processing workflow, end to end.',
};

/**
 * Read from `src/patterns` rather than listed here, so this index cannot
 * drift from what `get_pattern` serves: a pattern added to that barrel
 * appears on this page, and one that is half written stays off it. The
 * order is the barrel's own — the workflow order a record moves through,
 * which is why it is not sorted here.
 */
const built: readonly PatternExamplesData[] = patterns;

/**
 * Committed to but unbuilt, mirroring the `disabled: true` entries in
 * `navigation.ts`. Listed rather than hidden so the shape of the set is
 * legible: someone deciding whether to compose a settings screen by hand
 * should be able to see that one is coming.
 */
const planned: readonly { readonly name: string; readonly note: string }[] = [
  {
    name: 'Settings',
    note: 'Account, workspace and integration settings under one shell.',
  },
  {
    name: 'Auth',
    note: 'Sign-in, sign-up and the recovery flow between them.',
  },
];

function PatternCard({ pattern }: { pattern: PatternExamplesData }) {
  return (
    <Paper
      variant="outlined"
      component={NextLink}
      href={`/patterns/${pattern.slug}`}
      sx={{
        p: 3,
        borderRadius: 2,
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 120ms, box-shadow 120ms',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 1px var(--mui-palette-primary-main)',
        },
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {pattern.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexShrink: 0 }}
          >
            {pattern.components.length} components
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {pattern.description}
        </Typography>
      </Stack>
    </Paper>
  );
}

PatternCard.displayName = 'PatternCard';

export default function PatternsIndexPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Patterns
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {built.length} whole screens, composed from Atoms components and
            reviewed as arrangements rather than as parts. A pattern ships no
            runtime export — what you take from it is the page, as tsx, to
            paste and then edit. Start here rather than from the component
            pages: a screen assembled component by component gets the
            arrangement wrong in ways no single component page can warn you
            about.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The first five are the invoice processing workflow in the order a
            record moves through it — the queue, then each stage.{' '}
            <Link
              component={NextLink}
              href="/patterns/reporting"
              sx={{ fontWeight: 600 }}
            >
              Reporting
            </Link>{' '}
            sits outside that sequence: nothing moves through it, it looks back
            at every stage once they have run.
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Divider />
          <Typography variant="overline" color="text.secondary">
            Built
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2.5,
            }}
          >
            {built.map((pattern) => (
              <PatternCard key={pattern.slug} pattern={pattern} />
            ))}
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Divider />
          <Typography variant="overline" color="text.secondary">
            Planned
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2.5,
            }}
          >
            {planned.map((entry) => (
              <Paper
                key={entry.name}
                variant="outlined"
                sx={{ p: 3, borderRadius: 2 }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: 'text.disabled' }}
                    >
                      {entry.name}
                    </Typography>
                    <Chip
                      label="Soon"
                      size="small"
                      sx={{
                        fontSize: 10,
                        height: 18,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    {entry.note}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Divider />
          <Typography variant="body2" color="text.secondary">
            Need a screen that isn&apos;t here?{' '}
            <Link component={NextLink} href="/help" sx={{ fontWeight: 600 }}>
              Ask for it
            </Link>{' '}
            — a pattern is worth building once the same arrangement has been
            wanted twice.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
