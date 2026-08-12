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

import { data as menuData } from '@/src/components/Menu/Menu.examples';
import { data as menuItemData } from '@/src/components/MenuItem/MenuItem.examples';
import { MenuShowcase } from './_components/MenuShowcase';

import type { ComponentExamplesData } from '@/src/types/docs';

export const metadata = {
  title: 'Menu — Atoms',
  description: menuData.tagline,
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

function PropsTable({ props }: { props: ComponentExamplesData['props'] }) {
  return (
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
          {props.map((prop) => (
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
  );
}

PropsTable.displayName = 'PropsTable';

function ExampleList({ data }: { data: ComponentExamplesData }) {
  return (
    <Stack spacing={3}>
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
  );
}

ExampleList.displayName = 'ExampleList';

function Guidance({ data, label }: { data: ComponentExamplesData; label: string }) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
  );
}

Guidance.displayName = 'Guidance';

/**
 * Places where the implementation departs from the Figma sheet, and
 * why. Kept on the page rather than only in the source, because a
 * designer comparing the two will spot the difference and deserves the
 * reasoning without reading the component.
 */
const DESIGN_NOTES: readonly { title: string; body: string }[] = [
  {
    title: 'Hover is one layer above the design value',
    body: 'The menu-item sheet tints hover with surface/layers/card 2 — #f5f5f3, which is the exact fill of the panel it sits in. Inside a menu that hover is invisible. The item sheet was drawn against the page surface, where the tint reads fine; the composed menu is what ships, so hover moves one rung up the same ladder to card 3. Smallest deviation that preserves the intent.',
  },
  {
    title: 'Keyboard focus is not in the sheet',
    body: 'Arrow-key navigation is how a menu is meant to be operated, so the focused row cannot be left unstyled. It borrows hover\'s tint rather than the 3px focus ring the buttons use, which the panel\'s 4px inset would clip.',
  },
  {
    title: 'Disabled uses the token, not MUI\'s fade',
    body: 'MUI drops the whole row to 38% opacity. This system has a disabled text token, which keeps the label readable rather than washing it out, and matches every other disabled control here.',
  },
  {
    title: 'Long labels wrap',
    body: 'Figma gives the label word-break: break-word over a zero min-width, so a long label wraps inside the panel. MUI defaults to nowrap, which widens the panel instead and cannot be rescued with an ellipsis — a flexbox bug MUI documents as a Menu limitation. The design is followed here; sx={{ whiteSpace: \'nowrap\' }} puts MUI\'s behaviour back.',
  },
  {
    title: 'Dividers use the panel border token, not palette.divider',
    body: 'Both routes — a standalone Divider between groups, and MenuItem divider — are recoloured to the panel\'s own border token. MUI draws them from palette.divider, which in dark mode resolves darker than the panel they sit on (grey/1000 on grey/950) and reads as a smudge rather than a line. The border token is 8 levels lighter than the surface instead, and it makes the two routes agree with each other.',
  },
  {
    title: 'Dense changes the type, not the inset',
    body: 'The design specifies one density, so dense is MUI\'s knob rather than a Neoflo variant. It drops the label to B2 and the row to 32px — MUI\'s own documented dense height — while holding the 8px inset, rather than inventing a second inset the design never gave. Worth knowing if you style it yourself: MUI 9.2.0 derives the dense styles from the inherited list context but the dense class name from the item\'s own props, so a row inheriting dense from slotProps.list has the dense styling without the MuiMenuItem-dense class. This component matches on the list\'s class too, so both routes produce the same row.',
  },
  {
    title: 'The action tone tracks the token, not today\'s Figma hex',
    body: 'Figma currently reports text/primary/3 as #4949dc while this system\'s primary/500 is #4961dc. That is a drift in the raw brand accent affecting Button, Chip, and the palette too — not something specific to menus — so the component references the token and the drift is tracked with the design team.',
  },
];

export default function MenuDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / Navigation
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Menu
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {menuData.tagline} Import with{' '}
            <code>{`import { Menu, MenuItem } from '@neoflo/atoms';`}</code>
          </Typography>
          {menuData.figmaUrl && (
            <Link
              href={menuData.figmaUrl}
              target="_blank"
              rel="noreferrer"
              variant="body2"
              sx={{ width: 'fit-content', fontWeight: 600 }}
            >
              View design in Figma
            </Link>
          )}
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Two components
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <code>Menu</code>{' '}
            is the floating panel — the surface, the border, the corners,
            the shadow, and the positioning. It adds no props to
            MUI&apos;s, because the design draws one panel with no
            variants: everything MUI documents for <code>Menu</code>{' '}
            applies unchanged.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <code>MenuItem</code> is one row, and it is where the Neoflo
            API lives. Figma puts five values on a single axis —{' '}
            <code>primary</code>, <code>secondary</code>,{' '}
            <code>action</code>, <code>hover</code>,{' '}
            <code>selected</code> — which mixes two different things.
            Hover and selected are states MUI already models, so they are
            styled but not turned into props; what remains is the row&apos;s
            tone, and that is the one prop added:{' '}
            <code>variant=&quot;primary&quot; | &quot;secondary&quot; | &quot;action&quot;</code>.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Both components have a prop called <code>variant</code> and
            they mean unrelated things. On <code>Menu</code>{' '}
            it is MUI&apos;s focus behaviour (<code>menu</code> or{' '}
            <code>selectedMenu</code>); on <code>MenuItem</code> it is the
            label tone. They compose without interfering.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Reach for a <code>Select</code> instead when the list is form
            input: a bound value, a label, and validation belong in a
            field, not a floating panel. A Menu is for commands.
          </Typography>
        </Stack>

        <Divider />

        <MenuShowcase />

        <Divider />

        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Menu props
          </Typography>
          <PropsTable props={menuData.props} />
        </Stack>

        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            MenuItem props
          </Typography>
          <PropsTable props={menuItemData.props} />
        </Stack>

        <Divider />

        <Stack spacing={4} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Examples
          </Typography>
          <Stack spacing={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Menu
            </Typography>
            <ExampleList data={menuData} />
          </Stack>
          <Stack spacing={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              MenuItem
            </Typography>
            <ExampleList data={menuItemData} />
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Anatomy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The panel carries the inset and the items sit flush against
            each other, so the 4px gap you see at the panel edge is the
            panel&apos;s padding, not a gap between rows.
          </Typography>
          <CodeBlock>
            {[
              '<div class="MuiMenu-root MuiModal-root">',
              '  <div class="MuiMenu-paper MuiPaper-root">   <!-- card 2, 16px, 4px inset, Shadow/medium -->',
              '    <ul class="MuiMenu-list MuiList-root">    <!-- padding: 0 -->',
              '      <li class="MuiMenuItem-root MuiMenuItem-gutters">',
              '        <!-- 16px glyph, 4px gap, label -->',
              '      </li>',
              '    </ul>',
              '  </div>',
              '</div>',
            ].join('\n')}
          </CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Where this departs from the design
          </Typography>
          {DESIGN_NOTES.map((note) => (
            <Stack key={note.title} spacing={0.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {note.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {note.body}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider />

        <Stack spacing={4} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Guidance
          </Typography>
          <Guidance data={menuData} label="Menu" />
          <Guidance data={menuItemData} label="MenuItem" />
        </Stack>
      </Stack>
    </Container>
  );
}
