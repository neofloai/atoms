import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Chip } from '@/src/components/Chip';
import { reporting } from '@/src/patterns';
import { CodeBlock } from '../../_components/CodeBlock';
import { ReportingPreview } from './_components/ReportingPreview';

export const metadata = {
  title: 'Reporting pattern — Atoms',
  description: reporting.description,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

/** Tall enough to read a screenful of the snippet without owning the page. */
const CODE_MAX_HEIGHT_PX = 560;

/**
 * The width the preview is shown at, rather than the width of the docs column.
 *
 * Fourteen tiles in three bands and two breakdowns beside each other do not
 * fit in a 900px column, and narrowing them would misrepresent the pattern:
 * a row of four is a row of four, and stacking it would turn a comparison
 * into a list. So the frame keeps its proportions and this container scrolls.
 */
const PREVIEW_WIDTH_PX = 1320;

/** Docs route for a component named in `reporting.components`. */
function componentHref(name: string): string {
  const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `/components/${slug}`;
}

/**
 * What the screen works out for itself, stated rather than left to be
 * inferred from a screenshot.
 */
const DERIVED: readonly { title: string; what: string }[] = [
  {
    title: 'The trend arrow',
    what: 'The sign of `value − previous`, and nothing else. Two figures are stored per tile; the change between them is never stored, so it cannot disagree with them.',
  },
  {
    title: 'The trend colour',
    what: 'Whether that change is an improvement, which depends on the metric rather than on the arrow. Containment going up is green; failed-auth overrides going up is red. Both point up.',
  },
  {
    title: 'Every bar width',
    what: 'The share the row prints beside it. A bar and its label are two renderings of one number, so measuring the bar by hand is how a row ends up reading `0% auto` over a half-filled green track.',
  },
  {
    title: 'The comparison label',
    what: 'From the selected window. One derived string instead of six written ones, which is why it cannot say `vs prev 30d` on four tiles and `vs prior 30d` on two.',
  },
  {
    title: 'The coverage summary',
    what: 'How many days in the window fell under the floor, and which ones. The floor is the rule; the list is what the rule found.',
  },
];

export default function ReportingPatternPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Patterns
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {reporting.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {reporting.description}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            It reports, and it does not act
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Every other pattern here moves a record forward.{' '}
            <Link href="/patterns/invoice-dashboard">Invoice Dashboard</Link>{' '}
            opens one, <Link href="/patterns/extraction">Extraction</Link>{' '}
            confirms what was read off it,{' '}
            <Link href="/patterns/matching">Matching</Link> reconciles it and{' '}
            <Link href="/patterns/erp-posting">ERP Posting</Link> sends it. This
            screen does none of that. It has no <code>Proceed</code>, no{' '}
            <code>Reject</code>, and no row that opens anything.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            That is the line worth holding. A decision belongs to the stage that
            owns the record, where the person making it has the document in
            front of them. A control on a page that looks back at a month of
            work would be pressed by whoever happened to be reading the month.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            One band, and everything under it re-reads
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Range, entity and agent are the screen&apos;s only inputs, and they
            sit in a band that stays put while the rest scrolls — a window you
            cannot see is a window you will forget you chose. Every figure,
            every bar width, every comparison label and the coverage summary
            are computed from those three on each render.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            That is not decoration. A reporting screen is the one screen where a
            hardcoded number is indistinguishable from a correct one, because
            nothing else on the page contradicts it. Deriving is what makes the
            arithmetic the thing that gets reviewed.
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            What the screen works out
          </Typography>
          <Stack spacing={1.5} sx={{ maxWidth: PROSE }}>
            {DERIVED.map((item) => (
              <Box key={item.title}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.what}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Charts: use Recharts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Atoms ships no chart primitive, and this pattern does not hand-draw
            one. For anything that plots a series, the recommendation is{' '}
            <Link
              href="https://recharts.org/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Recharts
            </Link>{' '}
            — it composes, it takes a plain array, and the parts least worth
            writing yourself are exactly the parts it brings: axes, tooltips,
            responsive containers and an empty state.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep the series in the record and pass it in, so the same array
            feeds the chart and the text beside it. Colour it from{' '}
            <Link href="/tokens">the tokens</Link> —{' '}
            <code>icon.&lt;role&gt;.accent</code> is the saturated fill of a
            role and carries a dark-mode partner, which a raw hex does not.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The coverage card here shows what that chart is drawn to deliver
            rather than a picture of it. A floor line exists for the points
            below the floor, so the card names them: how many days breached,
            which dates, and by how much. That reading survives a narrow
            column, a print stylesheet and a screen reader.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Three tiles do not follow the band
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Routing accuracy, intent-classification accuracy and auto-answer
            accuracy come off a model-evaluation job that runs on its own fixed
            window. They hold still while the range moves, and that is a
            property of how they are measured rather than a bug.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A tile that quietly ignores the control the reader just used is
            worse than one that explains itself, so the info glyph on every card
            title carries that explanation. The glyph is the only place it can
            be said without inventing visible copy — which is also the answer to
            what those fourteen glyphs are for.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Rows with nothing in them
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Narrow the range to a day and some intents have no queries and some
            drivers have no occurrences. Those rows still render. An intent
            nobody asked about is a fact about the window, and dropping it makes
            the card shorter every time the range narrows — the reader would
            have to notice an absence to learn anything.
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Built from
          </Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {/* The anchor is the interactive element and the chip is the
                shape of it — `clickable` would put a button inside a link. */}
            {reporting.components.map((name) => (
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

        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            The screen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Change the range or the entity and watch the pills, the bars and the
            coverage card follow. The rail is the same one every screen in the
            app mounts, with its <code>Analytics</code> row selected.
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, overflowX: 'auto' }}>
            <Box sx={{ minWidth: PREVIEW_WIDTH_PX }}>
              <ReportingPreview />
            </Box>
          </Paper>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Code
          </Typography>
          <CodeBlock maxHeight={CODE_MAX_HEIGHT_PX}>{reporting.code}</CodeBlock>
        </Stack>

        <Stack spacing={3}>
          <Stack spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Do
            </Typography>
            {reporting.dos.map((item) => (
              <Typography
                key={item}
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: PROSE }}
              >
                • {item}
              </Typography>
            ))}
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Don&apos;t
            </Typography>
            {reporting.donts.map((item) => (
              <Typography
                key={item}
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: PROSE }}
              >
                • {item}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
