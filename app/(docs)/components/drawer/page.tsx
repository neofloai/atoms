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

import { data } from '@/src/components/Drawer/Drawer.examples';
import { CodeBlock } from '../../_components/CodeBlock';
import { DrawerShowcase } from './_components/DrawerShowcase';

export const metadata = {
  title: 'Drawer — Atoms',
  description: data.tagline,
};

export default function DrawerDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / {data.category}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Drawer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>{`import { Drawer } from '@neoflo/atoms';`}</code>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No Figma source — the panel takes the shared container surface,
            and its widths are measured from the shell it was built for.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Three variants, and only one of them is a modal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>temporary</code> is the default and the one to reach for
            first: the panel slides in over the page behind a scrim, and
            because it is a modal it arrives with a focus trap, an{' '}
            <code>Escape</code> handler and a scroll lock. Use it for anything
            opened, read and dismissed — a record, a form, a row of actions.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>persistent</code> and <code>permanent</code> are docked
            instead: they reserve their width in the layout, so the content
            beside them starts where the panel ends. <code>persistent</code>{' '}
            keeps an open state and reflows the page each time it changes,
            which is right for a filter rail somebody leaves open and wrong
            for a sheet they glance at. <code>permanent</code> has no open
            state at all — it is the app rail, and nothing has to track it.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The <code>anchor</code> decides more than which side the panel
            arrives from: it also picks the edge that draws the hairline —
            always the one facing the content — so a left rail is ruled on its
            right and a bottom sheet along its top.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Chrome sits a rung above content
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A drawer is not a card, and the design does not paint it like one.{' '}
            <code>Card</code> and <code>Dialog</code> are <code>card 1</code>;
            a rail and the bar above it are <code>card 2</code> behind a{' '}
            <code>card 2</code> edge — one rung further up the neutral ladder,
            so a card on the page reads as sitting <em>on</em> the app rather
            than beside it. <code>Navbar</code> binds the same pair, which is
            what lets a bar and a rail meet at the corner with no seam.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The corners are the one thing MUI already gets right — it draws the
            panel square, because something flush against the viewport has no
            outside corner to round.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There is no shadow. For a <code>temporary</code> drawer the
            backdrop does the separating, exactly as it does for a dialog; for
            a docked one the hairline does. If a panel does need the lift — a
            sheet with <code>hideBackdrop</code>, say — it is one line:{' '}
            <code>{`slotProps={{ paper: { sx: { boxShadow: 3 } } }}`}</code>.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Width, and the two places it has to land
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MUI ships no width at all — its own demos set one at every call
            site, on the root <em>and</em> on the panel, because the panel is{' '}
            <code>position: fixed</code> and reserves no space of its own.
            Miss the root and a permanent rail overlaps the page instead of
            sitting beside it.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>size</code> does both. Three rungs: <code>sm</code> is the
            220px nav rail, <code>md</code> (the default) is 400px for a form
            or a record, <code>lg</code> is the 520px detail sheet. They are
            shipped widths rather than a ladder invented to fill out three
            names, which is why the scale stops there — for anything else{' '}
            <code>size</code> takes a raw pixel number.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Do not put the width on <code>slotProps.paper</code> instead. The
            component writes both rules as descendant selectors, which outrank
            the single class an <code>sx</code> generates, so the panel would
            keep its <code>size</code> width and only the reserved space would
            move.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            On <code>top</code> and <code>bottom</code> anchors{' '}
            <code>size</code> does nothing, because MUI sizes those to their
            content and that is the right behaviour: a sheet of actions is as
            tall as the actions in it.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A collapsing rail is not a fourth size. It is the same panel
            narrowed, so it is the same prop with a different number —{' '}
            <code>{`size={collapsed ? 64 : 'sm'}`}</code>. Changes
            animate, and the panel clips its own overflow, which is what lets
            the labels drop out without pushing the rail back open.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            A docked drawer belongs to the viewport
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MUI keeps the panel <code>position: fixed</code> for every
            variant, so a <code>permanent</code> drawer pins itself to the
            edge of the window rather than of its container. That is what makes
            a full-height app rail work, and it is why the preview below —
            which is a rail inside a box on a docs page — puts the panel back
            in flow first:{' '}
            <code>{`slotProps={{ paper: { sx: { position: 'relative' } } }}`}</code>
            .
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The drawer supplies the panel and nothing inside it. There is no
            nav-row component, so a rail&apos;s contents are composed: the
            preview builds its rows from <code>ToggleButton</code>, the one
            house control that stays pressed, and its switcher and user row
            from <code>Button</code>s that open a <code>Menu</code>.
          </Typography>
        </Stack>

        <DrawerShowcase />

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
            <code>size</code> is the only prop this wrapper adds, and nothing
            is locked. Everything documented on{' '}
            <MuiLink
              href="https://mui.com/material-ui/react-drawer/"
              target="_blank"
              rel="noreferrer"
            >
              MUI&apos;s Drawer page
            </MuiLink>{' '}
            works here unchanged, including anything not listed — a{' '}
            <code>temporary</code> drawer is a <code>Modal</code>, so its props
            come through as well.
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
