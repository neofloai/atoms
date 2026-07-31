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

import { data } from '@/src/components/Stack/Stack.examples';
import { CodeBlock } from '../../_components/CodeBlock';
import { Demo } from '../../_components/Demo';
import { demos, truncationDemo } from './_components/demos';

export const metadata = {
  title: 'Stack — Atoms',
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

export default function StackDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / {data.category}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Stack
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="introduction">Introduction</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Stack manages the layout of its immediate children along one
            axis — vertical or horizontal — with optional spacing and
            dividers between each child. It is the component to reach for
            whenever a group of siblings needs an even gap, which is most of
            them.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Like <code>Box</code>, it is{' '}
            <strong>MUI&apos;s Stack unchanged</strong>, rather than wrapped.
            Stack does have props of its own — <code>direction</code>,{' '}
            <code>spacing</code>, <code>divider</code>,{' '}
            <code>useFlexGap</code> — but none of them names a design
            decision: <code>direction=&quot;row&quot;</code> is CSS
            vocabulary, not MUI vocabulary, and <code>spacing={'{2}'}</code>{' '}
            is an index into the Neoflo spacing scale, so the numbers you
            write are already ours. Wrapping it would put a second name on a
            CSS property and cost the polymorphic <code>component</code>{' '}
            typing. So the whole MUI prop surface applies here verbatim.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="stack-vs-box">Stack vs. Box</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Stack is concerned with one dimension: a row or a column whose
            children are spaced evenly. Reach for a flex or grid{' '}
            <code>Box</code> as soon as the layout has two axes, needs
            per-child placement, or gives different children different
            treatment. A row of three tiles is a Stack; a card grid is a Box.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The default <code>direction</code> is <code>column</code>, and the
            default <code>spacing</code> is <code>0</code> — so a bare{' '}
            <code>&lt;Stack&gt;</code> is a plain vertical flex container until
            you space it.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="import">Import</SectionHeading>
          <CodeBlock>{`import { Stack } from '@neoflo/atoms';`}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Stack carries MUI&apos;s own <code>&apos;use client&apos;</code>{' '}
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
              Two behaviours are worth knowing before you hit them. Both come
              from how flexbox and the default spacing implementation work,
              not from anything Neoflo adds.
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Margin on the children is ignored
            </Typography>
            <Typography variant="body2" color="text.secondary">
              By default Stack spaces children by setting margins on them, so
              a margin you set yourself is overwritten rather than added.
              There is no warning — the margin simply does nothing.{' '}
              <code>useFlexGap</code> switches to CSS <code>gap</code>, which
              leaves child margins alone.
            </Typography>
            <CodeBlock>
              {[
                '// The top margin is ignored: Stack sets its own margins',
                '// on its immediate children.',
                '<Stack spacing={2}>',
                '  <Box sx={{ mt: 4 }}>Not pushed down</Box>',
                '</Stack>',
                '',
                '// Honoured: CSS gap does not touch the children.',
                '<Stack spacing={2} useFlexGap>',
                '  <Box sx={{ mt: 4 }}>Pushed down</Box>',
                '</Stack>',
              ].join('\n')}
            </CodeBlock>
          </Stack>

          <Demo demo={truncationDemo} />
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="anatomy">Anatomy</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Stack is composed of a single root element — the children are not
            wrapped, which is why spacing has to be applied to them directly:
          </Typography>
          <CodeBlock>{`<div class="MuiStack-root">\n  <!-- children of the Stack, spaced in place -->\n</div>`}</CodeBlock>
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
