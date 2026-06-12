import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export const metadata = {
  title: 'MCP endpoint — Atoms',
  description:
    'Connect AI editors like Cursor and Claude Code to the Neoflo Atoms design system via the Model Context Protocol endpoint.',
};

interface McpTool {
  readonly name: string;
  readonly purpose: string;
}

const tools: readonly McpTool[] = [
  {
    name: 'list_components',
    purpose: 'Lists all components grouped by category',
  },
  {
    name: 'get_component',
    purpose:
      "Full spec for a named component: props, types, examples, do's and don'ts",
  },
  {
    name: 'get_tokens',
    purpose: 'Design tokens as JSON, optionally filtered to one category',
  },
  {
    name: 'get_pattern',
    purpose: 'Full page layout code for a named pattern',
  },
  {
    name: 'search_docs',
    purpose: 'Keyword search across components, patterns, and tokens',
  },
  {
    name: 'get_installation',
    purpose: 'Framework-specific setup steps (Next.js, React) for installing the package',
  },
];

const cursorConfig = `{
  "mcpServers": {
    "neoflo-atoms": {
      "url": "https://atoms.neoflo.ai/mcp"
    }
  }
}`;

const cursorLocalConfig = `{
  "mcpServers": {
    "neoflo-atoms": {
      "url": "http://localhost:3000/mcp"
    }
  }
}`;

const claudeCodeCommand = `claude mcp add --transport http neoflo-atoms https://atoms.neoflo.ai/mcp`;

const authConfig = `{
  "mcpServers": {
    "neoflo-atoms": {
      "url": "https://atoms.neoflo.ai/mcp",
      "headers": {
        "Authorization": "Bearer <your-token>"
      }
    }
  }
}`;

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

export default function McpGuidePage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Getting started
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            MCP endpoint
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Atoms ships a{' '}
            <Typography component="span" variant="body1" sx={{ fontWeight: 600 }}>
              Model Context Protocol
            </Typography>{' '}
            server at <code>/mcp</code>. Point your AI editor at it and the
            editor can query the real component catalog, design tokens, and
            page patterns at request time — no more hallucinated props or
            guessed colours.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Connect from Cursor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add the server to <code>.cursor/mcp.json</code> in your project
              (or to your global Cursor MCP settings) and reload. The Atoms
              tools appear in the editor automatically.
            </Typography>
          </Stack>
          <CodeBlock>{cursorConfig}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Working against a local checkout of this repo? Run{' '}
            <code>npm run dev</code> and point at localhost instead:
          </Typography>
          <CodeBlock>{cursorLocalConfig}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Connect from Claude Code
            </Typography>
            <Typography variant="body2" color="text.secondary">
              One command registers the endpoint over the Streamable HTTP
              transport.
            </Typography>
          </Stack>
          <CodeBlock>{claudeCodeCommand}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Available tools
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The server exposes exactly six tools. Responses are markdown,
              structured for AI consumption.
            </Typography>
          </Stack>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tool</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.name}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <code>{tool.name}</code>
                    </TableCell>
                    <TableCell>{tool.purpose}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Local development is open — no token needed. In production the
              endpoint requires a Bearer token when <code>MCP_TOKEN</code> is
              configured on the server. Add the header to your MCP config:
            </Typography>
          </Stack>
          <CodeBlock>{authConfig}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Ask the platform team for a token. If tokens are rotated, every
            consumer updates their <code>.cursor/mcp.json</code>.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            How data stays fresh
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The MCP server never reads component source directly. A generator
            (<code>npm run generate</code>) extracts components, tokens, and
            patterns from <code>src/</code> into versioned JSON manifests, and
            the tools serve from those. As new components land in the library
            they appear in <code>list_components</code> automatically — your
            editor always sees the catalog that shipped with the running
            version of this site.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
