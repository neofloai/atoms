import Box from '@mui/material/Box';

import { data } from '@/src/components/Box/Box.examples';
import { ThemeCallbackPreview } from './ThemeCallbackPreview';

/**
 * Live previews for the Box page, each paired with the exact snippet
 * that produces it.
 *
 * The snippet is not written here — it is looked up from
 * `Box.examples.tsx` by title, so the code a reader copies is the same
 * string the MCP `get_component` tool serves. `example()` throws on a
 * missing title, which fails `npm run build` rather than quietly
 * shipping a demo whose caption has drifted from its code.
 *
 * The previews below must therefore stay a faithful rendering of that
 * snippet. Where a snippet declares `tile`, the same object is used
 * here — not an approximation of it.
 */

/** Shared filler styling, declared in the snippets as `tile`. */
const tile = { p: 2, borderRadius: 1, bgcolor: 'action.hover' } as const;

export interface BoxDemo {
  title: string;
  description?: string;
  code: string;
  preview: React.ReactNode;
}

function example(title: string): { description?: string; code: string } {
  const found = data.examples.find((entry) => entry.title === title);
  if (!found) {
    throw new Error(
      `Box demo "${title}" has no example of that title in Box.examples.tsx. ` +
        'The docs previews and the MCP examples are paired by title — add or rename the example.'
    );
  }
  return { description: found.description, code: found.code };
}

function demo(title: string, preview: React.ReactNode): BoxDemo {
  return { title, ...example(title), preview };
}

export const demos: readonly BoxDemo[] = [
  demo(
    'Basics',
    <Box
      component="section"
      sx={{
        p: 2,
        borderRadius: 1,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      This Box renders an HTML section element.
    </Box>
  ),
  demo(
    'Customization',
    <Box
      sx={{
        width: 100,
        height: 100,
        borderRadius: 1,
        bgcolor: 'primary.main',
        '&:hover': { bgcolor: 'primary.dark' },
      }}
    />
  ),
  demo(
    'Flex layout',
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
      <Box sx={tile}>Left</Box>
      <Box sx={tile}>Centre</Box>
      <Box sx={tile}>Right</Box>
    </Box>
  ),
  demo(
    'Responsive values',
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
      }}
    >
      <Box sx={tile}>xs: 1fr</Box>
      <Box sx={tile}>md: repeat(3, 1fr)</Box>
      <Box sx={tile}>Third</Box>
    </Box>
  ),
  demo(
    'Any element, still typed',
    <Box
      component="a"
      href="/tokens"
      sx={{ color: 'primary.main', fontWeight: 600 }}
    >
      This Box is an anchor →
    </Box>
  ),
  // Rendered from a `'use client'` component: an `sx` callback is a
  // function, so it cannot cross the server→client boundary. See
  // ThemeCallbackPreview.
  demo('Reading the theme directly', <ThemeCallbackPreview />),
];
