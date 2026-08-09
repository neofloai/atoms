import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import NextLink from '@/app/_lib/Link';

import { Button } from '@/src/components/Button';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Help — Atoms',
  description:
    'Request a component, report a bug, or ask the maintainers of Neoflo Atoms a question.',
};

const PROSE = 760;

const REPO = 'https://github.com/neofloai/atoms';
const ISSUES = `${REPO}/issues`;

/**
 * Pre-filled issue links.
 *
 * The `labels` parameter only applies a label that already exists on
 * the repository; GitHub drops an unknown one and opens a blank issue,
 * so a missing label degrades to "still filed, just untriaged" rather
 * than a broken link.
 */
const NEW_COMPONENT_REQUEST = `${ISSUES}/new?labels=component-request&title=${encodeURIComponent('[Component] ')}`;
const NEW_BUG = `${ISSUES}/new?labels=bug&title=${encodeURIComponent('[Bug] ')}`;

/** Slack channel for anything that does not need a written record. */
const SLACK_CHANNEL = '#frontend-design-system';

interface Route {
  readonly title: string;
  readonly blurb: string;
  readonly action: { readonly label: string; readonly href: string } | null;
  readonly footnote?: string;
}

const routes: readonly Route[] = [
  {
    title: 'Request a component',
    blurb:
      'Atoms does not have what you need, or has it without the variant your screen calls for.',
    action: { label: 'Open a component request', href: NEW_COMPONENT_REQUEST },
    footnote: 'Filed with the component-request label.',
  },
  {
    title: 'Report a bug',
    blurb:
      'A component renders wrong, a prop does nothing, or the types refuse something the docs say is allowed.',
    action: { label: 'Open a bug report', href: NEW_BUG },
    footnote: 'Filed with the bug label.',
  },
  {
    title: 'Ask a question',
    blurb:
      'You are not sure it is a bug, you need an answer today, or you want a second opinion before building something.',
    action: null,
    footnote: `${SLACK_CHANNEL} on Slack.`,
  },
];

interface Situation {
  readonly situation: string;
  readonly answer: ReactNode;
}

const situations: readonly Situation[] = [
  {
    situation: 'The component I need is not in Atoms',
    answer: (
      <>
        <Link href={NEW_COMPONENT_REQUEST} target="_blank" rel="noopener noreferrer">
          Raise an issue
        </Link>{' '}
        with the <code>component-request</code> label. Check{' '}
        <Link
          href="https://mui.com/material-ui/all-components/"
          target="_blank"
          rel="noopener noreferrer"
        >
          mui.com
        </Link>{' '}
        first and say so in the issue — if MUI already ships it, the work is a
        wrapper and lands quickly. If it does not, the component needs a design
        before it needs an engineer.
      </>
    ),
  },
  {
    situation: 'A component behaves oddly',
    answer: (
      <>
        Atoms wraps Material UI rather than reimplementing it, so most
        surprising behaviour is MUI&apos;s own and is documented at{' '}
        <Link
          href="https://mui.com/material-ui/"
          target="_blank"
          rel="noopener noreferrer"
        >
          mui.com
        </Link>
        . Check there first. If the MUI docs say it should work and it does
        not, that is ours — <Link href={NEW_BUG} target="_blank" rel="noopener noreferrer">file a bug</Link>{' '}
        or ask in <code>{SLACK_CHANNEL}</code>.
      </>
    ),
  },
  {
    situation: 'It looks wrong in one colour mode only',
    answer: (
      <>
        Usually a token problem rather than a component problem, and worth
        reporting even when it seems cosmetic — say which surface the element
        sat on (page, card 1, card 2, card 3). Both the{' '}
        <Link component={NextLink} href="/tokens">
          tokens page
        </Link>{' '}
        and the component pages render every surface in both modes.
      </>
    ),
  },
  {
    situation: 'The MCP endpoint will not connect',
    answer: (
      <>
        Verify <code>npm run generate</code> has been run, check the URL in{' '}
        <code>.cursor/mcp.json</code>, and read the{' '}
        <Link component={NextLink} href="/mcp-guide">
          MCP guide
        </Link>
        . In production the endpoint also needs a Bearer token — ask in{' '}
        <code>{SLACK_CHANNEL}</code> for one.
      </>
    ),
  },
  {
    situation: 'This site and my installed copy disagree',
    answer: (
      <>
        This site tracks the default branch; your app is pinned to whatever
        commit or tag is recorded in your <code>package-lock.json</code>, since
        the package installs from git rather than npm. The{' '}
        <Link component={NextLink} href="/installation">
          installation page
        </Link>{' '}
        covers pinning and upgrading.
      </>
    ),
  },
];

const reportChecklist: readonly string[] = [
  'What you were building, not only what broke — the intent is usually what decides whether the answer is a fix, a new prop, or a different component',
  'The component and the prop, with a snippet small enough to paste straight back',
  'Which colour mode, and which surface it sat on — several past bugs were visible in one mode only',
  'The version of Atoms you have: the commit or tag recorded next to @neoflo/atoms in your package-lock.json',
  'A screenshot, and a Figma link if the design already exists',
];

interface Maintainer {
  readonly name: string;
  readonly area: string;
  readonly email: string;
  readonly owns: string;
}

const maintainers: readonly Maintainer[] = [
  {
    name: 'Ankit Verma',
    area: 'Engineering',
    email: 'ankit.v@neoflo.ai',
    owns: 'Component APIs, the theme, the package build, the MCP endpoint',
  },
  {
    name: 'Dhruva Vijayaraghavan',
    area: 'Design',
    email: 'dhruva.v@neoflo.ai',
    owns: 'Tokens, component specs, and sign-off on anything new',
  },
];

function RouteCard({ route }: { route: Route }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {route.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {route.blurb}
        </Typography>
        {/*
          No `target="_blank"` here, unlike the inline links below.
          `Button` is not polymorphic — its props are typed against
          `<button>`, so `target` and `rel` do not exist on them even
          though `href` really does render an anchor. Rather than cast
          around the type, the CTA navigates in the same tab; a
          cmd-click still opens a new one.
        */}
        {route.action && (
          <Button
            size="sm"
            appearance="outline"
            variant="secondary"
            href={route.action.href}
            sx={{ alignSelf: 'flex-start' }}
          >
            {route.action.label}
          </Button>
        )}
        {route.footnote && (
          <Typography variant="caption" color="text.secondary">
            {route.footnote}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

RouteCard.displayName = 'RouteCard';

export default function HelpPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1} sx={{ maxWidth: PROSE }}>
          <Typography variant="overline" color="text.secondary">
            Getting started
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Help
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Two routes, and the difference matters: an issue on the repository
            is the record, Slack is faster but forgets. If it should change the
            library, it needs an issue — a request that only ever existed in a
            thread is one nobody can pick up later.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {routes.map((route) => (
            <RouteCard key={route.title} route={route} />
          ))}
        </Box>

        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
          <Link href={ISSUES} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 600, fontSize: 14 }}>
            Browse open issues →
          </Link>
          <Link href={REPO} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 600, fontSize: 14 }}>
            View the repository →
          </Link>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={0.5} sx={{ maxWidth: PROSE }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Common situations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The five things people ask most, and where each one actually
              gets answered.
            </Typography>
          </Stack>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: '32%' }}>
                    Situation
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>What to do</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {situations.map((row) => (
                  <TableRow key={row.situation}>
                    <TableCell sx={{ verticalAlign: 'top', fontWeight: 600 }}>
                      {row.situation}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {row.answer}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            What to put in an issue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            None of this is required — an issue with a one-line description is
            still better than no issue. It is simply the difference between a
            fix in the same week and a thread of clarifying questions.
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            {reportChecklist.map((item) => (
              <Typography
                key={item}
                component="li"
                variant="body2"
                color="text.secondary"
              >
                {item}
              </Typography>
            ))}
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={0.5} sx={{ maxWidth: PROSE }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Maintainers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A new component needs both: a design to build against, and an
              API that fits the rest of the library. Anything with a visual
              identity is a design call first.
            </Typography>
          </Stack>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Area</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Looks after</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintainers.map((person) => (
                  <TableRow key={person.email}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {person.name}
                        </Typography>
                        <Link
                          href={`mailto:${person.email}`}
                          variant="caption"
                          color="text.secondary"
                        >
                          {person.email}
                        </Link>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {person.area}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {person.owns}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: PROSE }}>
            Day to day, <code>{SLACK_CHANNEL}</code> is faster than email.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
