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

import { data } from '@/src/components/Skeleton/Skeleton.examples';
import { SkeletonShowcase } from './_components/SkeletonShowcase';

export const metadata = {
  title: 'Skeleton — Atoms',
  description: data.tagline,
};

const PROSE = 760;

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

/**
 * Decisions taken without a design to check them against. Kept on the
 * page rather than only in `DESIGNER_QUESTIONS.md`, because a designer
 * comparing this to the rest of the library will notice it is the one
 * component with no Figma link and deserves to know why without
 * reading the source.
 */
const DESIGN_NOTES: { title: string; body: string }[] = [
  {
    title: 'There is no skeleton in the design library',
    body: 'Every other component here syncs against a Figma node. Searching the Product Design System for a skeleton, placeholder, or shimmer returns only the Phosphor Spinner icons, so this one was built from the MUI component and checked against our own palette rather than transcribed from a spec. Nothing below is a deviation from a design — it is a decision taken in the absence of one.',
  },
  {
    title: 'The fill is translucent, not a token',
    body: 'MUI tints the placeholder with 11% of the text colour in light and 13% in dark, which resolves through our own grey/1100 and grey/25. That was kept on purpose. A skeleton sits on the page, inside a card, or inside a card nested in a card, and no single solid grey covers all three: surface.disabled.default — the obvious candidate — is grey/900 in dark, which is exactly surface.layers.card3, so a placeholder inside a card 3 panel would vanish. Compositing holds a constant step instead, about 25 greyscale levels in light and 30 in dark, on every layer. The "Every surface" preview above is that claim, rendered.',
  },
  {
    title: 'The wave highlight is weaker in light mode',
    body: "MUI draws the wave's sweep from palette.action.hover, which is one of the few palette entries this theme leaves on MUI's stock values rather than mapping to tokens — 4% black in light, 8% white in dark. Measured on this page, the sweep moves the placeholder 9 greyscale levels in light and 16 in dark, so the light-mode wave is a little over half as strong. It was left alone rather than patched with an invented value: there is no highlight token to point it at, and adding one is a design decision. Pulse, the default, is unaffected.",
  },
  {
    title: 'Reduced motion is handled here, not in the theme',
    body: 'This is the first component in the library with an animation that never ends, and MUI 9 makes its own reduced-motion support opt-in through theme.motion.reducedMotion, which this theme does not set. The rules that stop the pulse and the wave are written into the component instead, so it stays correct for anyone who brings their own theme. Setting motion: { reducedMotion: "system" } on the theme would cover every transition in the library at once, and is worth doing as its own change.',
  },
  {
    title: 'The placeholder carries no ARIA',
    body: 'Matching MUI, whose documented ARIA for this component is "None". A skeleton is decoration; the loading state belongs to the region around it, marked with aria-busy. Adding aria-hidden to the root would also empty a live region whose only child is a placeholder. The container-level pattern is in the examples.',
  },
  {
    title: 'rounded is 8px, and a card is not',
    body: 'The rounded variant uses theme.shape.borderRadius, which this theme already sets to radius.sm — the design system default for controls, so there was nothing to override. A card in this system is 24px, so a card-shaped placeholder has to say so with sx={{ borderRadius: 3 }}. Changing what rounded means would have broken it for everything else.',
  },
];

export default function SkeletonDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Feedback
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Skeleton
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>{`import { Skeleton } from '@neofloai/atoms';`}</code>
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="body2" color="text.secondary">
            Reach for a skeleton when you know the shape of what is coming
            back — a list of people, a card, a headline. It holds that shape
            while the request is in flight, so the page does not collapse and
            then jump when the data lands. Reach for a spinner instead when
            you do not: saving a form, deleting a record, anything whose
            result has no layout.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The API is MUI&apos;s, unchanged. There was no Neoflo vocabulary
            to put in front of it —{' '}
            <code>variant</code> already names shapes rather than Material
            jargon, and <code>animation</code> names a behaviour — so nothing
            is renamed, removed, or added. What the wrapper contributes is
            the branded export and one behaviour MUI leaves switched off:
            respecting <code>prefers-reduced-motion</code>.
          </Typography>
        </Stack>

        <Divider />

        <SkeletonShowcase />

        <Divider />

        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Props
          </Typography>
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
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Examples
          </Typography>
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

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Decisions taken without a design
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is the only component in the library with no Figma link at
            the top of the page. Everything it looks like was chosen here, so
            it is all written down — and all open to being redlined.
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
              {data.dos.map((item) => (
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
              {data.donts.map((item) => (
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
