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

import { data } from '@/src/components/Grid/Grid.examples';
import { CodeBlock } from '../../_components/CodeBlock';
import { Demo } from '../../_components/Demo';
import { demos, verticalDemo } from './_components/demos';

export const metadata = {
  title: 'Grid — Atoms',
  description: data.tagline,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <Typography id={id} variant="h5" sx={{ fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

SectionHeading.displayName = 'SectionHeading';

/** The mechanics worth knowing before the first demo. */
const HOW_IT_WORKS: readonly string[] = [
  'Every Grid is a flex item. The `container` prop is what adds the flex container, so a grid is a container with items inside it — and one element can be both, which is how nesting works.',
  'Item widths are percentages, so they are fluid and always relative to the container rather than to the viewport.',
  'Gaps use the CSS `gap` property. The negative-margin implementation from MUI v5 and v6 is gone, along with the overflow workarounds it needed.',
  'Sizes are declared against five breakpoints from the theme — `xs` 0, `sm` 600, `md` 900, `lg` 1200, `xl` 1536. Neoflo does not override MUI\'s defaults.',
  'Items are placed in order and wrap when they run out of room. Grid does not span rows and does not back-fill gaps — see Limitations.',
  'It is a layout grid, not a data grid. Tabular data wants a table.',
];

export default function GridDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / {data.category}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Grid
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="introduction">Introduction</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Grid divides a row into columns and lets each child declare how
            many of them it occupies, per breakpoint. It is the component for
            page and section scaffolding — the two-thirds/one-third split, the
            card grid that becomes one column on a phone — where the widths
            need to relate to each other rather than to their content.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Like <code>Box</code> and <code>Stack</code>, it is{' '}
            <strong>MUI&apos;s Grid unchanged</strong>, rather than wrapped.
            Grid has the largest prop surface of the three primitives, but
            every prop names a CSS concept (<code>direction</code>,{' '}
            <code>wrap</code>), a token-scale index (<code>spacing={'{2}'}</code>{' '}
            resolves to 16px), or column arithmetic against a count the layout
            declares itself (<code>size</code>, <code>offset</code>,{' '}
            <code>columns</code>). None of them names a colour, a type style,
            or a state, so there is no MUI vocabulary to correct — and wrapping
            it would cost the polymorphic <code>component</code> typing. The
            whole MUI prop surface applies here verbatim.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you are porting code written against MUI v5 or v6: this is what
            used to be <code>Grid2</code>. There is no <code>item</code> prop
            and there are no <code>xs</code> / <code>md</code> props —{' '}
            <code>size={'{{ xs: 12, md: 6 }}'}</code> replaces them. The old
            props are ignored rather than flagged, so a stale layout looks
            broken instead of failing.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="how-it-works">How it works</SectionHeading>
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            {HOW_IT_WORKS.map((item) => (
              <Typography
                key={item}
                component="li"
                variant="body2"
                color="text.secondary"
              >
                {item.split('`').map((part, i) =>
                  i % 2 === 1 ? <code key={i}>{part}</code> : part
                )}
              </Typography>
            ))}
          </Stack>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="grid-vs-stack-vs-box">
            Grid vs. Stack vs. Box
          </SectionHeading>
          <Typography variant="body2" color="text.secondary">
            All three are unwrapped layout primitives, and they divide up
            cleanly. Reach for <code>Stack</code> when siblings just need an
            even gap along one axis — that is most layouts, and it needs no
            container and no column arithmetic. Reach for <strong>Grid</strong>{' '}
            when the widths are proportional to each other and have to change
            at breakpoints. Reach for <code>Box</code> when you need real CSS
            Grid — row spanning, named areas, auto-placement — or a surface
            rather than an arrangement.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A row of three buttons is a Stack. A page split into a sidebar and
            a main column is a Grid. A photo mosaic where tiles span two rows
            is a Box. <code>Container</code> sits above all three: it decides
            how wide the page is, and Grid divides whatever width it hands
            down.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="import">Import</SectionHeading>
          <CodeBlock>{`import { Grid } from '@neofloai/atoms';`}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Grid carries MUI&apos;s own <code>&apos;use client&apos;</code>{' '}
            boundary, so it renders straight from a React Server Component —
            no <code>&apos;use client&apos;</code> needed in your page. Every
            demo below is server-rendered.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={5} sx={{ maxWidth: PROSE }}>
          {demos.map((demo) => (
            <Demo key={demo.title} demo={demo} />
          ))}
        </Stack>

        <Divider />

        <Stack spacing={4} sx={{ maxWidth: PROSE }}>
          <Stack spacing={2}>
            <SectionHeading id="limitations">Limitations</SectionHeading>
            <Typography variant="body2" color="text.secondary">
              Grid is built on flexbox, not CSS Grid, which buys it fluid
              percentage widths and costs it two things. Both are deliberate on
              MUI&apos;s part, and both have a better answer than working
              around them.
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Column direction is not supported
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <code>direction</code> accepts <code>row</code> and{' '}
              <code>row-reverse</code> only. Grid exists to subdivide a layout
              into columns, so stacking its items vertically is not something
              it does — put a <code>Stack</code> inside the Grid item instead,
              which also keeps the vertical gap on the token scale.
            </Typography>
            <Demo demo={verticalDemo} />
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No row spanning or auto-placement
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items are laid out one after another and wrap when they run out
              of room. An item cannot span two rows, and a short item will not
              be pulled up to fill a gap left by its neighbours. When a layout
              genuinely needs either, it needs CSS Grid — which is a{' '}
              <code>Box</code>:
            </Typography>
            <CodeBlock>
              {[
                '// Grid places items in order and wraps. For row spanning or',
                '// gap back-filling, use CSS Grid on a Box instead.',
                '<Box',
                '  sx={{',
                "    display: 'grid',",
                '    gap: 2,',
                "    gridTemplateColumns: 'repeat(3, 1fr)',",
                "    gridAutoFlow: 'dense',",
                '  }}',
                '>',
                "  <Box sx={{ gridRow: 'span 2' }}>Spans two rows</Box>",
                '</Box>',
              ].join('\n')}
            </CodeBlock>
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="anatomy">Anatomy</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Every Grid is one root element. A container adds a second class
            rather than a second node, so the item is always a direct child of
            the container — which is what lets nesting inherit:
          </Typography>
          <CodeBlock>{`<div class="MuiGrid-root MuiGrid-container">\n  <div class="MuiGrid-root">\n    <!-- contents of the item -->\n  </div>\n</div>`}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <SectionHeading id="api">API</SectionHeading>
            <Typography variant="body2" color="text.secondary">
              Plus every native prop of whatever element{' '}
              <code>component</code> renders. The <code>ref</code> is forwarded
              to the root element.
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
