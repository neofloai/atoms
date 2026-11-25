import * as React from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import NextLink from '@/app/_lib/Link';
import { CodeBlock } from '../../_components/CodeBlock';
import { slug } from '../../_components/Demo';

/** Body copy width, as on every other docs page. Tables and code run wider. */
const PROSE = 760;

/** The plain text of a heading, for its anchor. */
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

/**
 * A chat guide topic's Markdown, drawn in the docs' own type: `h5`
 * sections, `body2` prose, outlined tables and the shared `CodeBlock`
 * with its copy button.
 *
 * The guide is written once in `src/chat/guide/` for this page and the
 * MCP `get_chat` tool alike, which is why it is Markdown rather than JSX.
 * Headings get the same anchors as `Demo` titles, so `/chat/hitl#…`
 * links written in the guide land.
 *
 * A server component: nothing here is interactive except the copy
 * button, which is `CodeBlock`'s own client leaf.
 */
const components: Components = {
  h2: ({ children }) => (
    <Typography variant="h5" component="h2" id={slug(textOf(children))} sx={{ fontWeight: 700, pt: 3 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="h6" component="h3" id={slug(textOf(children))} sx={{ fontWeight: 700, pt: 1 }}>
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: PROSE }}>
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ m: 0, pl: 3, maxWidth: PROSE, display: 'grid', gap: 0.75 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ m: 0, pl: 3, maxWidth: PROSE, display: 'grid', gap: 0.75 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography component="li" variant="body2" color="text.secondary">
      {children}
    </Typography>
  ),
  a: ({ href = '', children }) =>
    href.startsWith('/') || href.startsWith('#') ? (
      <Link component={NextLink} href={href}>
        {children}
      </Link>
    ) : (
      <Link href={href} target="_blank" rel="noreferrer noopener">
        {children}
      </Link>
    ),
  // A fenced block arrives as <pre><code class="language-…">; the shared
  // block wants the text.
  pre: ({ children }) => <CodeBlock>{textOf(children).replace(/\n$/, '')}</CodeBlock>,
  hr: () => <Divider />,
  blockquote: ({ children }) => (
    <Box sx={{ borderLeft: 3, borderColor: 'divider', pl: 2, maxWidth: PROSE }}>{children}</Box>
  ),
  table: ({ children }) => (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, overflowX: 'auto' }}>
      <Table size="small">{children}</Table>
    </Paper>
  ),
  thead: ({ children }) => <TableHead>{children}</TableHead>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => (
    <TableCell sx={{ fontWeight: 600, verticalAlign: 'bottom', whiteSpace: 'nowrap' }}>{children}</TableCell>
  ),
  td: ({ children }) => (
    <TableCell sx={{ verticalAlign: 'top', fontSize: 13, color: 'text.secondary' }}>{children}</TableCell>
  ),
};

export function GuideMarkdown({ children }: { children: string }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </Box>
  );
}
