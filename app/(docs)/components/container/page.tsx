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

import { Container } from '@/src/components/Container';
import { data } from '@/src/components/Container/Container.examples';
import { CodeBlock } from '../../_components/CodeBlock';
import { Demo } from '../../_components/Demo';
import { demos, nestedDemo } from './_components/demos';

export const metadata = {
  title: 'Container — Atoms',
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
  'A Container is `width: 100%` with `margin-left` and `margin-right` set to `auto` and a `max-width` on top. That is the entire mechanism — fluid below the bound, centred above it.',
  '`maxWidth` names a breakpoint from the theme: `sm` 600, `md` 900, `lg` 1200, `xl` 1536. Neoflo does not override MUI\'s values. The default is `lg`.',
  '`xs` is the exception. That breakpoint is `0`, so MUI clamps it to `Math.max(0, 444)` and an `xs` container is 444px, not zero.',
  'Gutters are horizontal padding — `theme.spacing(2)` below `sm`, `theme.spacing(3)` from `sm` up, so 16px and 24px against the Neoflo scale.',
  'It is `box-sizing: border-box`, so the gutters come out of the max-width rather than adding to it: a `sm` container is 600px wide in total, with 552px of content.',
  '`fixed` replaces the fluid bound with a stepped one — max-width becomes the min-width of the current breakpoint, so the page width jumps rather than grows.',
];

export default function ContainerDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / {data.category}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Container
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="introduction">Introduction</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Container is the outermost layout element on a page: it stops
            content from running the full width of a wide monitor, and it
            centres what is left. It is the only primitive in Atoms whose job
            is a single CSS property — everything else it does is in service of
            that <code>max-width</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Like <code>Box</code>, <code>Stack</code>, and <code>Grid</code>,
            it is <strong>MUI&apos;s Container unchanged</strong>, rather than
            wrapped. Its whole API is <code>maxWidth</code>,{' '}
            <code>fixed</code>, and <code>disableGutters</code>:{' '}
            <code>maxWidth=&quot;sm&quot;</code> is an index into the theme
            breakpoint scale in the same way <code>spacing={'{2}'}</code> is an
            index into the spacing scale, and the other two switch between CSS
            behaviours. None of them names a colour, a type style, or a state,
            so there is no MUI vocabulary to correct — and wrapping it would
            cost the polymorphic <code>component</code> typing, which matters
            more here than elsewhere because a Container is nearly always a
            landmark. The whole MUI prop surface applies here verbatim.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The one thing to hold onto:{' '}
            <strong>a Container is a width, not a surface</strong>. It renders
            nothing you can see. A background, a border, or a shadow belongs on
            a <code>Box</code> or a <code>Paper</code> around it — see the
            full-bleed demo below, which is the pattern most page layouts want.
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
          <SectionHeading id="container-vs-box">
            Container vs. Box
          </SectionHeading>
          <Typography variant="body2" color="text.secondary">
            A <code>Box</code> can do this —{' '}
            <code>sx={'{{ maxWidth: 600, mx: \'auto\', px: 3 }}'}</code> is
            close to the same rule set. Two things make the Container worth
            reaching for anyway: the width comes from the breakpoint scale
            rather than a number typed into a page, so it moves when the theme
            moves; and the name says what the element is for, which a Box with
            three layout properties does not.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The four primitives stack in one direction and do not overlap.
            Container bounds the page, <code>Grid</code> divides the width it
            establishes, <code>Stack</code> handles the vertical rhythm inside
            a column, and <code>Box</code> is the surface at the bottom. Use a
            Box instead when you are centring one element and nothing else —{' '}
            <code>mx: &apos;auto&apos;</code> is the whole of it, with no
            gutters and no bound to explain.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="import">Import</SectionHeading>
          <CodeBlock>{`import { Container } from '@neoflo/atoms';`}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Container carries MUI&apos;s own{' '}
            <code>&apos;use client&apos;</code> boundary, so it renders straight
            from a React Server Component — no{' '}
            <code>&apos;use client&apos;</code> needed in your page. Every demo
            below is server-rendered. This page is itself wrapped in one.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="body2" color="text.secondary">
            One caveat about the previews below: they render in a column about
            712px wide, which is narrower than the <code>md</code>,{' '}
            <code>lg</code>, and <code>xl</code> bounds. Only the{' '}
            <code>sm</code> and unbounded demos can show a bound actually
            taking hold — the rest is described rather than drawn. The dashed
            outline marks the space each Container was given, so the gutters
            and the centring are legible against it.
          </Typography>
        </Stack>

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
              Container is small enough to have few surprises. Two are worth
              knowing, and neither is a bug.
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nesting compounds the gutters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Containers nest without complaint and their padding adds up, so
              two defaults put 48px between the content and the edge instead of
              24px. The inner bound usually does nothing at all, because its{' '}
              <code>maxWidth</code> is wider than the space it was handed. Most
              nested Containers are accidents; when one is deliberate, disable
              its gutters.
            </Typography>
            <Demo demo={nestedDemo} />
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              <code>maxWidth=&quot;xs&quot;</code> is not the xs breakpoint
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Every other value resolves to its breakpoint. <code>xs</code>{' '}
              cannot, because that breakpoint is <code>0</code> and a
              zero-width container would be useless, so MUI clamps it to a
              literal 444px:
            </Typography>
            <CodeBlock>
              {[
                '// From MUI\'s Container styles — the only value that is not',
                '// simply theme.breakpoints.values[maxWidth].',
                'maxWidth: Math.max(theme.breakpoints.values.xs, 444)',
                '',
                '<Container maxWidth="xs" />   // 444px, not 0',
                '<Container maxWidth="sm" />   // 600px',
              ].join('\n')}
            </CodeBlock>
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="anatomy">Anatomy</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Container is a single root element — no wrapper, no inner track.
            The bound and the gutters are both on that one node, which is why{' '}
            <code>box-sizing</code> matters and why nesting doubles the
            padding:
          </Typography>
          <CodeBlock>{`<div class="MuiContainer-root MuiContainer-maxWidthLg">\n  <!-- contents of the Container -->\n</div>`}</CodeBlock>
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

        {data.accessibility && (
          <>
            <Divider />
            <Stack spacing={1.5} sx={{ maxWidth: PROSE }}>
              <SectionHeading id="accessibility">Accessibility</SectionHeading>
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
