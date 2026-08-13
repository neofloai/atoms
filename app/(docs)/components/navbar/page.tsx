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

import { data } from '@/src/components/Navbar/Navbar.examples';
import { CodeBlock } from '../../_components/CodeBlock';
import { NavbarShowcase } from './_components/NavbarShowcase';

export const metadata = {
  title: 'Navbar — Atoms',
  description: data.tagline,
};

export default function NavbarDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / {data.category}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Navbar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>{`import { Navbar, NavbarTitle } from '@neoflo/atoms';`}</code>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No Figma source — the bar takes the shared container surface, and
            its 48px height is measured from the shell it was built for.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            One component, because the two halves are never useful apart
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MUI splits this into an <code>AppBar</code> — a surface that knows
            how to stick to the top — and a <code>Toolbar</code>, the row that
            gives its children a height, a gutter and a shared baseline. Every
            app bar is both, so <code>Navbar</code> is both:{' '}
            <code>children</code> go into the row, and the bar around it is
            already the right height.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>NavbarTitle</code> is the one region that comes with it, for
            the <code>md</code> bar: a page title with an optional line of
            context under it. It exists because that block is geometry rather
            than composition — the type ramps, the 4px between the lines, and a{' '}
            <code>meta</code> row of 16px glyphs and labels with a vertical rule
            between each pair. The actions beside it stay with the caller,
            because whether a page&apos;s action is destructive or confirming is
            a decision about the page and not about its header.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The row is a flex container with no gap of its own, exactly as
            MUI&apos;s is. Spacing is composition — one{' '}
            <code>{`<Box sx={{ flex: 1 }} />`}</code> between the leading group
            and the trailing one gives the bar a single split point, and a
            tight cluster of icon buttons then chooses its own gap instead of
            inheriting one meant for a brand lockup.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            One treatment, no colour axis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MUI&apos;s app bar defaults to a saturated <code>primary</code>{' '}
            fill with white content. That is Material&apos;s signature and not
            this design&apos;s: the bar is <code>card 2</code>, closed by a
            single 1px <code>card 2</code> rule along the bottom and nothing
            else. Both read straight off the shell&apos;s own bar frame.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            That is a rung above the <code>card 1</code> a <code>Card</code> or
            a <code>Dialog</code> takes, and deliberately so — chrome sits
            above content on the neutral ladder, so a card on the page reads as
            sitting <em>on</em> the app. <code>Drawer</code> binds the same
            pair, so a bar above a rail matches it at the corner, and the bar
            reads as part of the app rather than a band laid across it.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            That is one treatment rather than a prop, the same way a{' '}
            <code>Card</code> has no variant. <code>color</code>,{' '}
            <code>enableColorOnDark</code>, <code>variant</code> and{' '}
            <code>square</code> are removed from the type rather than left to
            type-check and silently do nothing.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The shadow goes with them — the bottom rule is the separation. The
            exception is a bar that content scrolls under, which is the one
            case flat reads badly, so <code>elevation</code> is not locked
            away: <code>{`sx={{ boxShadow: 2 }}`}</code> puts the lift back.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            It does not float by default
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>position</code> defaults to <code>static</code>, not
            MUI&apos;s <code>fixed</code>. A fixed bar is out of flow, so the
            page underneath needs a spacer of exactly the bar&apos;s height or
            the first thing on it starts behind the bar — a footgun to inherit
            as a default. <code>static</code> puts the bar in flow above the
            content, which is what an app shell wants.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reach for <code>sticky</code> when the bar should stay put as the
            page scrolls: it is still in flow, so it needs no spacer, and it
            pins itself once the content moves under it. MUI&apos;s full{' '}
            <code>position</code> union still works if a layout genuinely needs{' '}
            <code>fixed</code> or <code>absolute</code>.
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Two heights, flat across every breakpoint
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>size=&quot;sm&quot;</code> is 48px — the app bar, one row of
            controls belonging to the whole screen.{' '}
            <code>size=&quot;md&quot;</code> is 72px, which is what a 28px
            title over a 16px line of context needs with 12px of inset above
            and below. Only the height differs between them: surface, rule,
            gutter and row are identical, which is why it is a{' '}
            <code>size</code> and not a <code>variant</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Neither ramps. MUI steps its toolbar from 56 to 64 at{' '}
            <code>sm</code> and its gutter from 16 to 24; here both are flat —
            48 or 72, inset 24 — which is what the frames draw, and it means a
            bar above a dialog-width panel shares its left edge.{' '}
            <code>NAVBAR_HEIGHT_PX</code> is exported, keyed by size, for the
            spacer a <code>fixed</code> bar needs and for anything that has to
            share a baseline with the bar&apos;s contents.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Because both heights are pinned, a third row does not belong inside
            one <code>Navbar</code> — put a <code>Tabs</code> bar underneath
            the header instead. And when the children already carry their own
            inset, as a full-bleed <code>Tabs</code> does,{' '}
            <code>disableGutters</code> drops the bar&apos;s.
          </Typography>
        </Stack>

        <NavbarShowcase />

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
            Everything documented on{' '}
            <MuiLink
              href="https://mui.com/material-ui/react-app-bar/"
              target="_blank"
              rel="noreferrer"
            >
              MUI&apos;s App Bar page
            </MuiLink>{' '}
            works here unchanged except the four locked props above, and{' '}
            <code>Paper</code>&apos;s own props come through as well.
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
