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

import { data } from '@/src/components/Table/Table.examples';
import { CodeBlock } from '../../_components/CodeBlock';
import { TableNotes } from './_components/TableNotes';
import { TableShowcase } from './_components/TableShowcase';

export const metadata = {
  title: 'Table — Atoms',
  description: data.tagline,
};

export default function TableDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Components / {data.category}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Table
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {data.tagline} Import with{' '}
            <code>
              {`import { Table, TableHead, TableBody, TableRow, TableCell } from '@neofloai/atoms';`}
            </code>
          </Typography>
          {data.figmaUrl && (
            <MuiLink
              href={data.figmaUrl}
              target="_blank"
              rel="noreferrer"
              variant="body2"
              sx={{ width: 'fit-content', fontWeight: 600 }}
            >
              View design in Figma
            </MuiLink>
          )}
        </Stack>

        <Divider />

        <TableNotes />

        <TableShowcase />

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
            Grouped by which component they go on. Everything documented on{' '}
            <MuiLink
              href="https://mui.com/material-ui/react-table/"
              target="_blank"
              rel="noreferrer"
            >
              MUI&apos;s Table page
            </MuiLink>{' '}
            works here unchanged except for four locked props: the table&apos;s{' '}
            <code>padding</code>, the cell&apos;s <code>size</code> and{' '}
            <code>variant</code>, and the sort label&apos;s{' '}
            <code>IconComponent</code> — each of which would type-check and
            change nothing a reader can see. <code>TableContainer</code>,{' '}
            <code>TableHead</code> and <code>TableBody</code> take MUI&apos;s
            props and add none.
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
