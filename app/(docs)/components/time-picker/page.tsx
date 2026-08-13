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

import { data } from '@/src/components/TimePicker/TimePicker.examples';
import { TimePickerShowcase } from './_components/TimePickerShowcase';

export const metadata = {
  title: 'TimePicker — Atoms',
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

export default function TimePickerDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Inputs
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            TimePicker
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>{`import { TimePicker } from '@neoflo/atoms';`}</code>
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
            The value carries a date as well as a time
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It is a{' '}
            <MuiLink href="https://day.js.org/" target="_blank" rel="noreferrer">
              Day.js
            </MuiLink>{' '}
            object, the same type <code>DatePicker</code> uses — and Day.js has
            no time-only type, so the value is a full date-time. An untouched
            picker fills the date half from today, or from{' '}
            <code>referenceDate</code>. Read the time off it and ignore the
            rest, or set <code>referenceDate</code> to the day the time belongs
            to. It matters as soon as two times are compared, because two
            pickers left on their defaults will both be dated today.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There is nothing to configure:{' '}
            <code>NeofloThemeProvider</code> installs the adapter, so a picker
            anywhere below it works. A picker rendered <em>outside</em> that
            provider throws, because MUI X reads its adapter from React
            context.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            It opens two different clocks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            On a pointer device the popover holds scrolling columns — hours,
            minutes, and AM/PM where the locale uses it. On a touch device a
            modal holds an analog face with a draggable hand. Both are MUI&apos;s
            own defaults, kept deliberately rather than collapsed into one, and
            both are styled here. <code>viewRenderers</code> moves the line if
            an app wants one of them everywhere.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Which <em>digital</em> clock appears is decided by how many options
            <code>timeSteps</code> produces, not by a variant. The count is{' '}
            <code>1440 ÷ (timeSteps.hours × timeSteps.minutes)</code>: once it
            reaches <code>thresholdToRenderTimeInASingleColumn</code> — 24 by
            default — the popover renders one list of times, and above it,
            separate columns. So the default 5-minute step gives 288 and renders
            columns, <code>{`{ minutes: 60 }`}</code> gives 24 and renders a
            list, and a half-hour step gives 48, which stays on columns until
            the threshold is raised to match.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            One difference from <code>DatePicker</code> is worth expecting: the
            time popover carries a <strong>Cancel / OK</strong> row even on the
            desktop, where the calendar has none. That is MUI&apos;s default and
            the right one — picking an hour should not dismiss the popover
            before the minutes have been picked. Set{' '}
            <code>closeOnSelect</code> to change it.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            The second component with no design
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The Product Design System draws no picker of any kind — searching
            it for a clock returns the <code>Clock</code>, <code>Timer</code>{' '}
            and <code>Alarm</code> glyphs and no component set, exactly as it
            did for the date picker. So this page and{' '}
            <code>DatePicker</code>&apos;s are the only two in Atoms whose
            visuals are not a transcription of a Figma node.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Two of its three surfaces are specified, just under another name,
            and both are now shared with the date picker rather than copied.
            The <strong>field</strong> is a text field, read off{' '}
            <code>TextField</code> — the same 8px inset, 8px corners, 1px
            border, bottom-edge focus accent, and the same three statuses. The{' '}
            <strong>popover</strong> is a floating panel, read off{' '}
            <code>Menu</code>: <code>card 2</code> fill and border, 16px
            corners, <code>Shadow/medium</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The <strong>clock</strong> is the part nobody has drawn. Its
            geometry is left exactly as MUI X ships it — 56px columns, a 220px
            analog face — and only its colour and type are moved onto house
            tokens. The columns are built from <code>MenuItem</code>, so they
            take that component&apos;s treatment: 8px corners, an 8px inset,
            rows sitting flush as <code>Menu</code> specifies. The one
            departure is the selected value, which takes the{' '}
            <em>solid</em> primary fill a selected day takes in the calendar
            rather than the subtle tint a selected menu row takes — a
            picker&apos;s two views have to agree with each other before either
            agrees with a menu.
          </Typography>
        </Stack>

        <TimePickerShowcase />

        <Divider />

        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Props
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
            The four lifted props come first, then the MUI X props worth
            naming. Everything documented on{' '}
            <MuiLink
              href="https://mui.com/x/react-date-pickers/time-picker/"
              target="_blank"
              rel="noreferrer"
            >
              MUI X&apos;s TimePicker page
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
