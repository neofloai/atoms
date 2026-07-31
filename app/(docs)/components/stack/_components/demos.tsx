import { Avatar } from '@/src/components/Avatar';
import { Box } from '@/src/components/Box';
import { Stack } from '@/src/components/Stack';
import { data } from '@/src/components/Stack/Stack.examples';
import type { ComponentDemo } from '../../../_components/Demo';
import { demoFactory } from '../../../_components/demoPairing';

/**
 * Live previews for the Stack page, each paired with the exact snippet
 * that produces it.
 *
 * The snippets are not written here — `demoFactory` looks them up from
 * `Stack.examples.tsx` by title and throws on a miss, so a renamed
 * example fails the build instead of quietly shipping a demo whose
 * caption has drifted from its code.
 *
 * These previews import from `@/src/components/*` rather than
 * `@mui/material`, so the page exercises the same export path a
 * consumer of `@neoflo/atoms` would take.
 */

/** Filler styling, declared in the snippets as `tile`. */
const tile = { p: 2, borderRadius: 1, bgcolor: 'action.hover' } as const;

const demo = demoFactory(data);

/** The main sequence, in the order the page documents them. */
export const demos: readonly ComponentDemo[] = [
  demo(
    'Basics',
    <Stack spacing={2}>
      <Box sx={tile}>Item 1</Box>
      <Box sx={tile}>Item 2</Box>
      <Box sx={tile}>Item 3</Box>
    </Stack>
  ),
  demo(
    'Direction',
    <Stack direction="row" spacing={2}>
      <Box sx={tile}>Item 1</Box>
      <Box sx={tile}>Item 2</Box>
      <Box sx={tile}>Item 3</Box>
    </Stack>
  ),
  demo(
    'Dividers',
    <Stack
      direction="row"
      spacing={2}
      divider={<Box sx={{ width: '1px', bgcolor: 'divider' }} />}
    >
      <Box sx={tile}>Item 1</Box>
      <Box sx={tile}>Item 2</Box>
      <Box sx={tile}>Item 3</Box>
    </Stack>
  ),
  demo(
    'Responsive values',
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 2, md: 4 }}
    >
      <Box sx={tile}>Item 1</Box>
      <Box sx={tile}>Item 2</Box>
      <Box sx={tile}>Item 3</Box>
    </Stack>
  ),
  demo(
    'Flexbox gap',
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Box sx={tile}>Item 1</Box>
      <Box sx={tile}>Item 2</Box>
      <Box sx={tile}>An item long enough to force a wrap</Box>
    </Stack>
  ),
  demo(
    'Customization',
    <Stack
      direction="row"
      spacing={2}
      sx={{
        p: 2,
        borderRadius: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'action.hover',
      }}
    >
      <Box>Aligned and spaced apart</Box>
      <Avatar size="sm">NF</Avatar>
    </Stack>
  ),
];

/**
 * Shown inside the Limitations section rather than the main sequence: it
 * documents a flexbox behaviour Stack inherits, not a feature Stack has.
 */
export const truncationDemo: ComponentDemo = demo(
  'Truncating text in a row',
  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
    <Avatar size="sm">NF</Avatar>
    <Box
      sx={{
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      A single line of text that is long enough to need truncating, rather than
      pushing the row wider than the container it sits in.
    </Box>
  </Stack>
);
