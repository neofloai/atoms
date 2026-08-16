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

import { data } from '@/src/components/DatePicker/DatePicker.examples';
import { DatePickerShowcase } from './_components/DatePickerShowcase';

export const metadata = {
  title: 'DatePicker — Atoms',
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

export default function DatePickerDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Inputs
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            DatePicker
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>{`import { DatePicker } from '@neofloai/atoms';`}</code>
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
            The value is a Day.js object
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Not a native <code>Date</code>. A date picker needs a library to
            parse and compare dates, and Atoms standardises on{' '}
            <MuiLink href="https://day.js.org/" target="_blank" rel="noreferrer">
              Day.js
            </MuiLink>{' '}
            — so <code>value</code>, <code>defaultValue</code>,{' '}
            <code>minDate</code>, <code>maxDate</code> and the argument to{' '}
            <code>onChange</code> are all <code>Dayjs</code>. Call{' '}
            <code>.toDate()</code> at the boundary where you hand a date to
            something that wants the built-in type.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There is nothing to configure:{' '}
            <code>NeofloThemeProvider</code> installs the adapter, so a picker
            anywhere below it works. A picker rendered{' '}
            <em>outside</em> that provider throws, because MUI X reads its
            adapter from React context.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            The one component with no design
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The Product Design System draws no date picker — the library has
            the <code>CalendarBlank</code> glyph and its siblings, and no
            component set. So this is the one page in Atoms whose visuals are
            not a transcription of a Figma node, and it is worth knowing which
            parts are settled and which are not.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Two of its three surfaces are specified, just under another name.
            The <strong>field</strong> is a text field, and every value in it
            is read off <code>TextField</code> — the same 8px inset, 8px
            corners, 1px border, bottom-edge focus accent, and the same three
            statuses. The <strong>popover</strong> is a floating panel, read
            off <code>Menu</code>: <code>card 2</code> fill and border, 16px
            corners, <code>Shadow/medium</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The <strong>calendar grid</strong> is the part nobody has drawn.
            Its geometry is left exactly as MUI X ships it — 36px cells,
            circular days — and only its colour and type are moved onto house
            tokens, each role filled from the ladder the design system already
            uses for that job: a selected day takes the primary fill and
            on-colour ink from <code>Button</code>, today takes the primary
            border, a disabled day the disabled ink. If a date picker is ever
            designed, the grid is what will move.
          </Typography>
        </Stack>

        <DatePickerShowcase />

        <Divider />

        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Props
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
            The four lifted props come first, then the MUI X props worth
            naming. Everything documented on{' '}
            <MuiLink
              href="https://mui.com/x/react-date-pickers/date-picker/"
              target="_blank"
              rel="noreferrer"
            >
              MUI X&apos;s DatePicker page
            </MuiLink>{' '}
            works here unchanged, including anything not listed.
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
