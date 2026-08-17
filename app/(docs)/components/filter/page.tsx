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

import { data } from '@/src/components/Filter/Filter.examples';
import { Demo } from '../../_components/Demo';
import { demos } from './_components/demos';

export const metadata = {
  title: 'Filter — Atoms',
  description: data.tagline,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

export default function FilterDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / {data.category}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Filter
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>{`import { Filter } from '@neofloai/atoms';`}</code>
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            How it is put together
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The panel is mostly for narrowing a table. The full pattern —
            a search box and a badged trigger above a <code>DataGrid</code>,
            with one <code>Clear Filters</code> resetting both — is the{' '}
            <Link href="#filtering-a-data-grid">
              Filtering a data grid
            </Link>{' '}
            example below.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The panel is described, not composed. One <code>groups</code>{' '}
            array carries the rail and the panes together, because the two
            are one thing — splitting them across children invites a rail
            row with no pane behind it. Everything the panel draws is a
            component from this library: the rail badges are{' '}
            <code>Chip size=&quot;sm&quot;</code>, the option rows are{' '}
            <code>Checkbox</code>, the search field is{' '}
            <code>TextField</code>, and the three actions are text{' '}
            <code>Button</code>s.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It is a fixed size in both axes on purpose. The rail never
            changes length while the pane does, so letting content drive
            the box makes the panel jump every time a category is picked —
            and a panel anchored under a button jumps upwards, into the
            pointer. The option list scrolls instead.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The button that opens the panel is yours, not the panel&apos;s —
            but the count on it should be. Once the panel closes, that
            badge is the only thing left saying the table is filtered, so{' '}
            <code>countActiveFilters(groups, value)</code> ships alongside
            the component: it sums exactly what the rail sums, including
            groups that declare their own <code>count</code>, which
            totalling <code>value</code> by hand would miss.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>Select all</code> and <code>Clear all</code> at the foot
            of the pane both act on the rows the current search leaves
            visible. With an empty search that is everything; with a search
            running it is the only reading where the two agree with each
            other. <code>Clear all filter</code> in the title bar is the
            unscoped one.
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

        <Stack spacing={5}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Examples
          </Typography>
          {demos.map((item) => (
            <Demo key={item.title} demo={item} />
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
