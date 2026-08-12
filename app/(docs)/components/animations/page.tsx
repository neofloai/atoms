import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { APP_BAR_HEIGHT } from '@/app/(docs)/_components/navigation';
import { data as collapse } from '@/src/components/Collapse/Collapse.examples';
import { data as fade } from '@/src/components/Fade/Fade.examples';
import { data as grow } from '@/src/components/Grow/Grow.examples';
import { data as slide } from '@/src/components/Slide/Slide.examples';
import { data as zoom } from '@/src/components/Zoom/Zoom.examples';
import { AnimationsShowcase } from './_components/AnimationsShowcase';

import type { ComponentExamplesData } from '@/src/types/docs';

export const metadata = {
  title: 'Animations — Atoms',
  description:
    "Fade, Grow, Zoom, Slide, and Collapse — MUI's five transitions under the Neoflo API, each honouring the OS reduced-motion setting.",
};

const PROSE = 760;
const ANCHOR_OFFSET_SX = { scrollMarginTop: APP_BAR_HEIGHT + 16 };

/**
 * One page for all five transitions, mirroring MUI's own single
 * Transitions page rather than splitting into five near-identical
 * ones. They share a prop surface, a set of defaults, and a single
 * decision — which of the five — so the comparison is the
 * documentation. Each still has its own anchor, its own card on
 * `/components`, and its own entry in the MCP manifest, so
 * `get_component("Fade")` resolves to a component and not to a page.
 */
const TRANSITIONS: readonly (readonly [string, ComponentExamplesData])[] = [
  ['fade', fade],
  ['grow', grow],
  ['zoom', zoom],
  ['slide', slide],
  ['collapse', collapse],
];

/** Which one to reach for, in one line each. */
const CHOOSING: readonly {
  name: string;
  use: string;
  layout: string;
}[] = [
  {
    name: 'Fade',
    use: 'Anything that appears in place — a message, a backdrop, an image that finished loading.',
    layout: 'Never moves the page',
  },
  {
    name: 'Grow',
    use: 'A surface emerging from its trigger, at a size you do not know in advance.',
    layout: 'Never moves the page',
  },
  {
    name: 'Zoom',
    use: 'A small control of known size — an icon button, a chip, a badge.',
    layout: 'Never moves the page',
  },
  {
    name: 'Slide',
    use: 'Anything belonging to an edge — a sheet, a drawer, a bar arriving from the bottom.',
    layout: 'Never moves the page',
  },
  {
    name: 'Collapse',
    use: 'Disclosure — an expanding row, an accordion, a dismissed alert.',
    layout: 'Reflows the page',
  },
];

/**
 * Decisions taken without a design to check them against — the same
 * section `Skeleton` carries, for the same reason. Motion is the
 * larger gap of the two: it is absent from the design library
 * entirely, so every number on this page is MUI's.
 */
const DESIGN_NOTES: readonly { title: string; body: string }[] = [
  {
    title: 'The design library specifies no motion',
    body: 'Searching the Product Design System for durations, easing curves, or a transition variant on any component sheet returns nothing — there is no motion group and no component draws one. So these five ship with MUI\'s Material timings (225ms in, 195ms out, a 300ms standard, and the four Material easing curves) rather than with Neoflo values, because there are no Neoflo values to use. Nothing here is a deviation from a design; it is what happens in the absence of one.',
  },
  {
    title: 'No motion tokens were invented to fill the gap',
    body: 'The obvious move — add src/tokens/motion.ts, put some plausible durations in it, point theme.transitions at them — was deliberately not taken. Every other token in this system traces back to the designer\'s Figma export; a motion token invented in code would be the only one that does not, and it would look identical to the ones that do. Timings are read from theme.transitions instead, which keeps them themeable and keeps the fact that they are MUI\'s visible rather than laundered.',
  },
  {
    title: 'reducedMotion is now system-wide',
    body: 'src/theme/index.ts sets motion: { reducedMotion: "system" }. MUI 9 defaults it to "never", so until now every transition in the library ignored the OS setting. Turning it on affects more than this page: Menu\'s open animation, and any MUI internal built on these transitions, now complete instantly for a user who has asked for less motion. The state change is unaffected; only the tween is dropped.',
  },
  {
    title: 'These are re-exports, not wrappers',
    body: 'A transition renders no DOM of its own — it clones its child and animates the child\'s style. There is no colour, type, border, or state to brand, and the entire API is a boolean, a duration, and a CSS timing function, none of which is a Material word. Wrapping would also make them less themed, not more: the timing defaults resolve from theme.transitions at render time, so a wrapper with baked-in numbers would replace a themeable default with a fixed one. Same carve-out Box, Stack, Grid, and Container take, recorded in src/index.ts.',
  },
  {
    title: 'Collapse renders DOM, and still takes the carve-out',
    body: 'It is the closest call of the five: Collapse does render three nested divs, which do the measuring. They carry height, overflow, and min-height and nothing else — no colour, no spacing, no border — so there is still no brand decision encoded in them and nothing to rename.',
  },
];

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

function PropsTable({ data }: { data: ComponentExamplesData }) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 1.5 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Prop</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Default</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <code>{prop.name}</code>
              </TableCell>
              <TableCell>
                <code>{prop.type}</code>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <code>{prop.default}</code>
              </TableCell>
              <TableCell>{prop.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

PropsTable.displayName = 'PropsTable';

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
      {items.map((item) => (
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
  );
}

BulletList.displayName = 'BulletList';

/**
 * One transition's full documentation. Identical for all five, which
 * is the argument for one page rather than five files repeating this
 * markup with a different import at the top.
 */
function TransitionSection({
  id,
  data,
}: {
  id: string;
  data: ComponentExamplesData;
}) {
  return (
    <Stack spacing={3} id={id} sx={ANCHOR_OFFSET_SX}>
      <Stack spacing={1} sx={{ maxWidth: PROSE }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {data.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data.tagline}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <code>{`import { ${data.name} } from '@neoflo/atoms';`}</code>
        </Typography>
      </Stack>

      <PropsTable data={data} />

      <Stack spacing={3} sx={{ maxWidth: PROSE }}>
        {data.examples.map((example) => (
          <Stack key={example.title} spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {example.title}
            </Typography>
            {example.description && (
              <Typography variant="body2" color="text.secondary">
                {example.description}
              </Typography>
            )}
            <CodeBlock>{example.code}</CodeBlock>
          </Stack>
        ))}
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        sx={{ maxWidth: PROSE }}
      >
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Do
          </Typography>
          <BulletList items={data.dos} />
        </Stack>
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Don&apos;t
          </Typography>
          <BulletList items={data.donts} />
        </Stack>
      </Stack>

    </Stack>
  );
}

TransitionSection.displayName = 'TransitionSection';

export default function AnimationsDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Motion
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Animations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Five transitions — <code>Fade</code>, <code>Grow</code>,{' '}
            <code>Zoom</code>, <code>Slide</code>, and{' '}
            <code>Collapse</code> — for showing and hiding things without
            them appearing out of nowhere. All five import from{' '}
            <code>@neoflo/atoms</code>.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="body2" color="text.secondary">
            Each takes a single boolean, <code>in</code>, and animates one
            child between hidden and shown when it flips. That is the whole
            model: no timeline, no orchestration layer, no animation library.
            If you can express the state as a boolean, one of these five
            renders it.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The API is MUI&apos;s, unchanged — there was no Neoflo vocabulary
            to put in front of it. A transition renders no colour, type,
            border, or surface, and its entire surface is a boolean, a
            duration in milliseconds, and a CSS timing function. What these
            contribute over reaching into <code>@mui/material</code> yourself
            is the branded import path, timings that resolve from the Neoflo
            theme, and one behaviour MUI ships switched off: respecting{' '}
            <code>prefers-reduced-motion</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The child has to accept a <code>ref</code> and a{' '}
            <code>style</code> prop, because that is how the animation is
            applied — a DOM element, any Atoms component, or any{' '}
            <code>forwardRef</code> component works. A component that drops
            either will render and silently never animate.{' '}
            <code>Collapse</code> is the exception: it wraps its content
            rather than cloning it, so any node is a valid child.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Choosing one
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: PROSE }}
          >
            The decision is almost always about layout: four of the five
            animate over the page and leave it still, while{' '}
            <code>Collapse</code>{' '}
            changes the height of the page and moves everything below it.
            Pick that axis first and the rest follows.
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Transition</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reach for it</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Layout</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CHOOSING.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <code>{row.name}</code>
                    </TableCell>
                    <TableCell>{row.use}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.layout}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <Divider />

        <AnimationsShowcase />

        <Divider />

        {TRANSITIONS.map(([id, data], index) => (
          <Box key={id}>
            {index > 0 && <Divider sx={{ mb: 6 }} />}
            <TransitionSection id={id} data={data} />
          </Box>
        ))}

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Decisions taken without a design
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Motion is absent from the design library, so every timing on
            this page came from MUI rather than from a spec. It is all
            written down here, and all open to being redlined.
          </Typography>
          {DESIGN_NOTES.map((note) => (
            <Stack key={note.title} spacing={0.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {note.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {note.body}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
