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

import { data } from '@/src/components/Box/Box.examples';
import { CodeBlock } from '../../_components/CodeBlock';
import { Demo } from '../../_components/Demo';
import { demos } from './_components/demos';

export const metadata = {
  title: 'Box — Atoms',
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

export default function BoxDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / {data.category}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Box
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="introduction">Introduction</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Box is a generic container for grouping other components. Think of
            it as a <code>&lt;div&gt;</code> with two extra features: access to
            the Neoflo theme, and the <code>sx</code> prop. It is the
            lowest-level building block in Atoms — everything visual is
            something you pass in.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It is also the only component in Atoms that is{' '}
            <strong>MUI&apos;s Box unchanged</strong>, rather than wrapped.
            Every other component puts a Neoflo API on the outside —{' '}
            <code>variant=&quot;primary&quot;</code> instead of{' '}
            <code>variant=&quot;contained&quot;</code>. Box renders no colour,
            type, border, or state of its own, so there is no MUI naming to
            correct and no brand decision to encode: it is on-brand by
            construction, because <code>sx</code> resolves against the
            token-built theme. Wrapping it would also cost the polymorphic{' '}
            <code>component</code> typing shown below. So the whole MUI prop
            surface applies here verbatim.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="usage">Usage</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Box is intentionally multipurpose and open-ended, just like a{' '}
            <code>&lt;div&gt;</code>. That is what makes it the wrong default:
            reach for the component that already models what you are building,
            and use Box for the layout between them.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A bordered Box is not a Card. A tinted Box is not an{' '}
            <code>Alert</code>. A padded Box with a label is not a{' '}
            <code>Chip</code>. When a purpose-built component exists, it
            carries states, accessibility, and both colour schemes that a Box
            does not — reproducing its look by hand is how a product drifts
            off-system.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For a row or a column of evenly spaced siblings, reach for{' '}
            <code>Stack</code>; for proportional column widths that change at
            breakpoints, reach for <code>Grid</code>. Both are the same kind of
            unwrapped primitive, and both put the gap in one place rather than
            on every child. Box is for what neither expresses: real CSS Grid —
            row spanning, named areas, auto-placement — per-child placement, or
            a surface rather than an arrangement. MUI&apos;s remaining
            containers — Container for page width, Paper for elevated
            surfaces — are not re-exported yet.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="import">Import</SectionHeading>
          <CodeBlock>{`import { Box } from '@neoflo/atoms';`}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Box carries MUI&apos;s own <code>&apos;use client&apos;</code>{' '}
            boundary, so it renders straight from a React Server Component —
            no <code>&apos;use client&apos;</code> needed in your page. Every
            demo below is server-rendered, with one exception: an{' '}
            <code>sx</code> <em>callback</em> is a function and cannot be
            serialized across that boundary, so the last one lives in a client
            component.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={5} sx={{ maxWidth: PROSE }}>
          {demos.map((demo) => (
            <Demo key={demo.title} demo={demo} />
          ))}
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <SectionHeading id="anatomy">Anatomy</SectionHeading>
          <Typography variant="body2" color="text.secondary">
            Box is composed of a single root element — no wrapper, no extra
            nodes — so it is safe to use as a direct child in a flex or grid
            container:
          </Typography>
          <CodeBlock>{`<div class="MuiBox-root">\n  <!-- contents of the Box -->\n</div>`}</CodeBlock>
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
