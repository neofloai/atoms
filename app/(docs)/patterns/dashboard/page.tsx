import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Chip } from '@/src/components/Chip';
import { dashboard } from '@/src/patterns';
import { CodeBlock } from '../../_components/CodeBlock';
import { DashboardPreview } from './_components/DashboardPreview';

export const metadata = {
  title: 'Dashboard pattern — Atoms',
  description: dashboard.description,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

/** Tall enough to read a screenful of the snippet without owning the page. */
const CODE_MAX_HEIGHT_PX = 560;

/** Docs route for a component named in `dashboard.components`. */
function componentHref(name: string): string {
  const slug = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
  return `/components/${slug}`;
}

export default function DashboardPatternPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Patterns
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {dashboard.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {dashboard.description}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            How it is put together
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A pattern is not a component. Nothing new is exported for this
            page — it is an arrangement of components that already ship, and
            the reason to write it down is that the arrangement is the part
            teams re-derive and get subtly different every time.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The rail runs the full height of the app and the bar starts
            where the rail ends, so the outer box is a <strong>row</strong>{' '}
            — rail, then a column — rather than a bar with a row under it.
            Two things follow. The brand mark is the top-left corner of the
            screen, and the bar cannot hold anything that has to line up
            with the rail, which is why the collapse toggle sits at its
            leading edge: it is the one control whose position does not move
            when the rail folds.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The page under the bar is three bands — title, toolbar, grid —
            and only the last one is elastic. The first two are as tall as
            what is in them; the grid gets <code>flex: 1</code> and{' '}
            <code>minHeight: 0</code>, so it takes what is left and its
            footer lands on the bottom edge of the screen at any window
            height. <code>DataGrid</code> draws no border, radius or fill of
            its own for exactly this reason: it is a band between two
            hairlines here, not a card dropped onto a page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The toolbar is one row, and the split across it is the contract:
            free-text search on the left, the controls that change what the
            table shows on the right. The two questions really are
            different — the box asks whether a row mentions something, the
            panel asks whether a row is one of a set — and a row has to
            answer both, so the rule lives in one function rather than in
            either control. One <code>Clear Filters</code> resets the pair,
            because from the reader&apos;s side there is one filtered table.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The rail&apos;s folded width goes through{' '}
            <code>size</code> as a number rather than onto the paper: the
            width has to reach the space the rail reserves as well as the
            panel itself, and changes to it animate. Its contents are the
            same ones the <Link href="/components/drawer">Drawer</Link> page
            composes, and the table below is the{' '}
            <Link href="/components/filter#filtering-a-data-grid">Filter</Link>{' '}
            page&apos;s. This page is the two of them assembled, sharing the
            same code — a second copy of either would drift.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Built from
          </Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {/* The anchor is the interactive element and the chip is the
                shape of it — `clickable` would put a button inside a link. */}
            {dashboard.components.map((name) => (
              <Link
                key={name}
                href={componentHref(name)}
                underline="none"
                sx={{ display: 'inline-flex' }}
              >
                <Chip
                  size="sm"
                  variant="secondary"
                  label={name}
                  sx={{ cursor: 'pointer' }}
                />
              </Link>
            ))}
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              The screen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live. Fold the rail with the toggle, search the table, and
              open the panel to narrow it — the trigger keeps the count once
              the panel closes.
            </Typography>
          </Stack>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <DashboardPreview />
          </Paper>
          <Typography variant="body2" color="text.secondary">
            The rows, the columns and the facet options are the
            application&apos;s, so the snippet imports them rather than
            inventing them. Everything that is layout is in it.
          </Typography>
          <CodeBlock maxHeight={CODE_MAX_HEIGHT_PX}>{dashboard.code}</CodeBlock>
        </Stack>

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={4}
          sx={{ maxWidth: PROSE }}
        >
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Do
            </Typography>
            <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
              {dashboard.dos.map((item) => (
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
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Don&apos;t
            </Typography>
            <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
              {dashboard.donts.map((item) => (
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
        </Stack>
      </Stack>
    </Container>
  );
}
