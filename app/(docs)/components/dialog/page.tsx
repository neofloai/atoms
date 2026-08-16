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

import { data } from '@/src/components/Dialog/Dialog.examples';
import { DialogShowcase } from './_components/DialogShowcase';

export const metadata = {
  title: 'Dialog — Atoms',
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

export default function DialogDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Feedback
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Dialog
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>
              {`import { Dialog, DialogTitle, DialogContent, DialogActions } from '@neofloai/atoms';`}
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
            Five parts, composed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>Dialog</code> is the shell — it owns <code>open</code>, the
            backdrop, and how the panel is dismissed. The four parts inside it
            are regions you stack: <code>DialogTitle</code> for the heading,{' '}
            <code>DialogContent</code> for the body,{' '}
            <code>DialogContentText</code> for a paragraph inside that body, and{' '}
            <code>DialogActions</code> for the footer. There is no variant prop
            anywhere — a dialog is built, not configured.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The body region carries padding and nothing else, so anything goes
            in it: a <code>TextField</code>, a <code>Select</code>, a{' '}
            <code>Stack</code> of fields, an <code>Alert</code>, a list of{' '}
            <code>Checkbox</code> rows. Use <code>DialogContentText</code> only
            for prose — the sentence that explains what the dialog is asking.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>DialogTitle</code> is the one part with an API beyond
            MUI&apos;s. A heading here is up to four things at once — a title, a
            second line under it, an icon badge above it, and a close button at
            the trailing edge — so those are <code>children</code>,{' '}
            <code>subtitle</code>, <code>icon</code>, and <code>onClose</code>{' '}
            rather than a row you assemble yourself each time.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            The panel is a Card, and carries no shadow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The panel is drawn from the same three tokens a <code>Card</code>{' '}
            is: the <code>card 1</code> surface behind a 1px{' '}
            <code>card 1</code> border, with 16px corners. So a dialog and a
            card on one page cannot drift apart, and a dialog needs no styling
            of its own to look like it belongs.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It has no shadow, and that is deliberate: the{' '}
            <strong>backdrop</strong> does the separating. Dimming the whole
            page pulls the panel forward far harder than a shadow would, which
            is why a flat 1px edge is enough. Elevation is reachable rather
            than locked if a dialog does want the lift —{' '}
            <code>slotProps={'{{ paper: { sx: { boxShadow: 3 } } }}'}</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The footer&apos;s top rule is the only border inside the panel, and
            it uses that same <code>card 1</code> border token — as do{' '}
            <code>DialogContent</code>&apos;s optional <code>dividers</code>, so
            every edge in a dialog matches the one around it in both colour
            schemes.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Width
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>maxWidth</code> is MUI&apos;s breakpoint scale — <code>xs</code>{' '}
            through <code>xl</code>, or <code>false</code> to lift the cap —
            and it defaults to <code>sm</code>. Left alone, the panel hugs its
            content up to that width.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add <code>fullWidth</code> to any dialog with fields in it, so the
            panel grows to <code>maxWidth</code> and holds one width instead of
            resizing as the content changes. For small screens, pair{' '}
            <code>fullScreen</code> with <code>useMediaQuery</code> rather than
            setting it outright.
          </Typography>
        </Stack>

        <DialogShowcase />

        <Divider />

        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Props
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 720 }}
          >
            One flat table across all five parts; region props are prefixed
            with the component that owns them. Everything documented on{' '}
            <MuiLink
              href="https://mui.com/material-ui/react-dialog/"
              target="_blank"
              rel="noreferrer"
            >
              MUI&apos;s Dialog page
            </MuiLink>{' '}
            works here unchanged, including anything not listed — the props of{' '}
            <code>Modal</code> come through as well.
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
