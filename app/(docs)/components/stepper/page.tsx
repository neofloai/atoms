import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { data } from '@/src/components/Stepper/Stepper.examples';
import { StepperShowcase } from './_components/StepperShowcase';

export const metadata = {
  title: 'Stepper — Atoms',
  description: data.tagline,
};

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

export default function StepperDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Navigation
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Stepper
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>
              {`import { Stepper, Step, StepLabel, StepContent } from '@neofloai/atoms';`}
            </code>
          </Typography>
          {data.figmaUrl ? (
            <MuiLink
              href={data.figmaUrl}
              target="_blank"
              rel="noreferrer"
              variant="body2"
              sx={{ width: 'fit-content', fontWeight: 600 }}
            >
              View design in Figma
            </MuiLink>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No Figma source
            </Typography>
          )}
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            The two shapes it has
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A stepper is a wizard or a timeline, and the difference is one
            prop. Left alone, <code>StepContent</code> is mounted only while
            its step is active — MUI&apos;s behaviour, and what a multi-step
            form wants. Add <code>expanded</code> to each <code>Step</code>{' '}
            and every description stays open, which is the timeline Figma
            draws.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            State works the same way from both ends.{' '}
            <code>activeStep</code> derives it from position: the steps
            before it are done, the one at it is done, the rest are not.
            Pass <code>activeStep={'{-1}'}</code> and set{' '}
            <code>completed</code> per step when the order is not an index.
          </Typography>
        </Stack>

        <StepperShowcase />

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

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
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
          sx={{ maxWidth: 720 }}
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
