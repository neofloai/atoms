import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { data } from '@/src/components/Snackbar/Snackbar.examples';

import { CodeBlock } from '../../_components/CodeBlock';
import { SnackbarShowcase } from './_components/SnackbarShowcase';

export const metadata = {
  title: 'Snackbar — Atoms',
  description: data.tagline,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

export default function SnackbarDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Feedback
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Snackbar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>
              {`import { SnackbarProvider, useSnackbar } from '@neofloai/atoms';`}
            </code>
          </Typography>
        </Stack>

        <Divider />

        <SnackbarShowcase />

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Two halves, and MUI ships one
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The surface is the easy half:{' '}
            <Link href="/components/alert">Alert</Link> in its{' '}
            <code>floating</code> treatment, anchored top right, sliding in
            from that edge, closing itself after five seconds. Those defaults
            are most of what this component is for — the same toast written by
            hand comes out in a different corner with a different transition
            every time.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The other half is the queue, and it is the part every app writes
            for itself. Feedback arrives from event handlers, sometimes two at
            once — a failed save that also cleared a filter — and two toasts
            in the same corner means the second one covers the first.{' '}
            <code>SnackbarProvider</code> holds one on screen and promotes the
            next when it leaves, in the order they were fired.{' '}
            <code>useSnackbar</code> is the handle you fire into, so a screen
            that reports something needs no state of its own to do it.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mount the provider once, inside{' '}
            <code>NeofloThemeProvider</code>. Nothing renders until a message
            is queued.
          </Typography>
          <CodeBlock>{data.examples[0].code}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Calling <code>useSnackbar</code> outside a provider throws rather
            than doing nothing. A confirmation that silently never appears
            makes the save look broken when the save was fine.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Where it goes, and which way it moves
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Top right by default, and not MUI&apos;s bottom left. A toast
            reporting the outcome of something the user just did belongs near
            where they are looking; bottom left is a mobile convention that on
            a desktop dashboard collides with the nav rail and sits diagonally
            opposite whatever was clicked.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The slide follows the anchor rather than being set separately, so
            it always enters from the nearest edge and leaves the same way.
            Move <code>anchorOrigin</code> to the bottom left and the toast
            comes in from the left; a centred anchor has no near side, so it
            travels vertically instead. There is no way to end up with a
            top-right toast flying in from the wrong side of the screen.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Props
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: PROSE }}>
            These are the <code>Snackbar</code> component&apos;s.{' '}
            <code>notify</code> takes the same <code>severity</code>,{' '}
            <code>message</code>, <code>title</code>, <code>action</code> and{' '}
            <code>autoHideDuration</code>; <code>SnackbarProvider</code> takes{' '}
            <code>anchorOrigin</code> and <code>autoHideDuration</code> as
            defaults for every message it shows.
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
