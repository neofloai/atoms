import Paper from '@mui/material/Paper';

/**
 * Monospace snippet block used across the docs pages.
 *
 * Extracted here so a page can render code next to the live demo it
 * produces without each page redeclaring the same Paper.
 */
export function CodeBlock({ children }: { children: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
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
  );
}

CodeBlock.displayName = 'CodeBlock';
