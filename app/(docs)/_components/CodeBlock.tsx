import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { CopyButton } from './CopyButton';

/**
 * Monospace snippet block used across the docs pages.
 *
 * Extracted here so a page can render code next to the live demo it
 * produces without each page redeclaring the same Paper. Stays a server
 * component itself; CopyButton is the client leaf that needs the browser
 * clipboard API.
 */
export function CodeBlock({ children }: { children: string }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          pr: 6,
          borderRadius: 1.5,
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 13,
          lineHeight: 1.6,
          bgcolor: 'action.hover',
          whiteSpace: 'pre',
          overflowX: 'auto',
        }}
      >
        {children}
      </Paper>
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <CopyButton code={children} />
      </Box>
    </Box>
  );
}

CodeBlock.displayName = 'CodeBlock';
