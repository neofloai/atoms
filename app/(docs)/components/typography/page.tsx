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

import { data } from '@/src/components/Typography/Typography.examples';
import { TypographyShowcase } from './_components/TypographyShowcase';

export const metadata = {
  title: 'Typography — Atoms',
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
 * The four MUI variants this component does not offer, and what to write
 * instead. Kept on the page because the substitution is the single thing
 * someone arriving from MUI needs to know, and a compile error alone does
 * not say what to do next.
 */
const RETIRED: { variant: string; material: string; instead: string }[] = [
  {
    variant: 'subtitle1',
    material: '16px / 1.75, weight 400',
    instead: 'variant="body1" weight="medium"',
  },
  {
    variant: 'subtitle2',
    material: '14px / 1.57, weight 500',
    instead: 'variant="body2" weight="medium"',
  },
  {
    variant: 'button',
    material: '14px / 1.75, uppercase',
    instead: 'Nothing — Button sets its own type',
  },
  {
    variant: 'overline',
    material: '12px / 2.66, uppercase',
    instead: 'variant="caption" plus sx for the tracking, if it is wanted',
  },
];

export default function TypographyDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Data Display
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Typography
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>{`import { Typography } from '@neofloai/atoms';`}</code>
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="body2" color="text.secondary">
            Every size, leading, and letter-spacing this component can
            produce comes from the typography tokens by way of{' '}
            <code>src/theme/typography.ts</code>. So <code>variant</code> is
            the whole API for setting text: there is no reason to write a{' '}
            <code>fontSize</code> anywhere in a screen, and a number written
            by hand is a number nobody specified.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The reason it is wrapped rather than re-exported is narrower than
            that, and worth knowing. The theme styles MUI&apos;s{' '}
            <code>Typography</code> correctly for the nine rungs it maps, so
            importing it from <code>@mui/material</code> appears to work —
            and for <code>h1</code>–<code>h6</code>, <code>body1</code>,{' '}
            <code>body2</code> and <code>caption</code> it does. The other
            four variants are the problem: <code>subtitle1</code>,{' '}
            <code>subtitle2</code>, <code>button</code> and{' '}
            <code>overline</code> are not mapped, so they fall through to
            Material&apos;s own metrics. A screen that reaches for{' '}
            <code>subtitle2</code> above a group of fields — which is the
            natural thing to reach for — leaves the design system with no
            error and nothing visible to give it away.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            So <code>variant</code> is narrowed to the rungs that resolve
            from tokens, and <code>weight</code> is added, because the scale
            has two cuts of every rung and the theme can only bind one of
            them to a variant. A subtitle in this system is not its own rung
            — it is a body rung in its Medium cut.
          </Typography>
        </Stack>

        <Divider />

        <TypographyShowcase />

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Coming from MUI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Four of MUI&apos;s variants are not available here. Each one
            below carries Material&apos;s numbers rather than any from this
            scale, which is why it was left out rather than passed through.
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>MUI variant</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    What it would have given you
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Write instead</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {RETIRED.map((row) => (
                  <TableRow key={row.variant}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <code>{row.variant}</code>
                    </TableCell>
                    <TableCell>{row.material}</TableCell>
                    <TableCell>
                      <code>{row.instead}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary">
            <code>weight</code> is also what replaces{' '}
            <code>sx={`{{ fontWeight: 700 }}`}</code>. DM Sans ships
            Regular, Medium and SemiBold and has no Bold cut, so a literal
            700 asks the browser to synthesise one — <code>semibold</code> is
            the top of the ladder, and the three values{' '}
            <code>weight</code> accepts are the only three the font has.
          </Typography>
        </Stack>

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
