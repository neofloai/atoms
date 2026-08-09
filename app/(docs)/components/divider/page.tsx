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

import { data } from '@/src/components/Divider/Divider.examples';
import { DividerShowcase } from './_components/DividerShowcase';

export const metadata = {
  title: 'Divider — Atoms',
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
 * page rather than only in `DESIGNER_QUESTIONS.md`, for the same reason
 * the Skeleton page carries its own: a designer will notice this is one
 * of the few components with no Figma link and deserves to know why
 * without reading the source.
 */
const DESIGN_NOTES: { title: string; body: string }[] = [
  {
    title: 'There is no divider in the design library',
    body: 'Searching the Product Design System for a divider, separator, rule, or line returns component sets for arithmetic — MathOperations, Calculator, Minus — and nothing else. So this was built from the MUI component and checked against our own tokens rather than transcribed from a spec. Nothing below is a deviation from a design; it is a decision taken in the absence of one.',
  },
  {
    title: 'The hairline is border.default.default, not palette.divider',
    body: 'This is the only visual change the wrapper makes, and it fixes something broken. MUI paints the rule from palette.divider, which this theme sets to grey/1000 in dark — exactly the value of surface.layers.card1. A divider on a card 1 surface is therefore the same colour as the card, measuring 1.00:1, and does not render at all. On card 2 and on background.paper it is darker than what it sits on, so it reads as a smudge. border.default.default is the system’s neutral border token, the same one a secondary outline Button uses, and it is lighter than every dark layer and darker than every light one. Every surface improves: 1.00 to 1.74 on dark card 1, 1.04 to 1.82 on dark paper, 1.09 to 1.41 on light card 3.',
  },
  {
    title: 'Light-mode rules get one rung stronger',
    body: 'The cost of using a single token everywhere. A light divider moves from grey/200 to grey/300, so it is slightly more present than MUI’s default. That was chosen over keeping two values that each work in one colour scheme and fail in the other. If it reads too heavy, this is the number to redline — it is one token reference in Divider.tsx.',
  },
  {
    title: 'The fix is local, and the root cause is not',
    body: 'palette.divider itself is the problem, and correcting it in src/theme/palette.ts would fix MenuItem’s divider prop, MUI’s own components, and this docs site in one move. It would also restyle every existing surface, so it belongs in its own change rather than riding along with a new component. Menu already hand-patches the same issue for dividers inside a menu panel, and that override still wins there — it is a descendant selector, so it outranks this component’s own class.',
  },
  {
    title: 'variant keeps Material’s indents',
    body: 'inset is a hardcoded margin-left: 72px — the width of a Material list avatar plus its gutter — and middle is theme.spacing(2), 16px, which is not on the Neoflo spacing scale at all (4, 8, 12, 24, 48, 64, 96). Both were left on MUI’s numbers rather than quietly re-pointed, for the same reason no motion tokens were invented: a number chosen here would be indistinguishable from one a designer specified. fullWidth, the default, involves no such number. Until there is a spec, control the inset from the parent’s padding.',
  },
  {
    title: 'The width stays on MUI’s thin',
    body: 'Every browser resolves the CSS thin keyword to 1px, and replacing it would mean restating the horizontal/vertical border-side logic — MUI zeroes all four borders and re-adds borderBottomWidth or borderRightWidth depending on orientation — for no visible gain.',
  },
  {
    title: 'Nothing was added to the ARIA',
    body: 'MUI already gets this right. A plain divider renders a real <hr>, which is a separator natively. Adding children or orientation="vertical" switches the root to a <div>, and MUI supplies role="separator" plus the matching aria-orientation itself. There was nothing left to fix.',
  },
];

export default function DividerDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Layout
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Divider
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>{`import { Divider } from '@neoflo/atoms';`}</code>
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="body2" color="text.secondary">
            Reach for a divider when whitespace alone has stopped doing the
            job. Space is the first tool for separating two groups; a rule is
            what you add when the groups sit close together, or when a row of
            items needs marking off without room to spread them out. A page
            with a rule between every block has stopped using either.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The API is MUI&apos;s, unchanged. <code>orientation</code>,{' '}
            <code>flexItem</code>, and <code>textAlign</code> all name CSS
            concepts rather than Material jargon, so nothing is renamed,
            removed, or added. What the wrapper contributes is the branded
            export and one fix: a hairline drawn from the token scale instead
            of <code>palette.divider</code>, which in dark mode is the same
            colour as the <code>card 1</code> surface and does not render on
            it.
          </Typography>
        </Stack>

        <Divider />

        <DividerShowcase />

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
            This page has no Figma link at the top, because there is no
            divider in the library to link to. Everything it looks like was
            chosen here, so it is all written down — and all open to being
            redlined.
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

        {data.accessibility && (
          <>
            <Divider />
            <Stack spacing={1.5} sx={{ maxWidth: PROSE }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Accessibility
              </Typography>
              <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
                {data.accessibility.map((item) => (
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
          </>
        )}
      </Stack>
    </Container>
  );
}
