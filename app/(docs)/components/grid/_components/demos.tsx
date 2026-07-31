import { Box } from '@/src/components/Box';
import { Grid } from '@/src/components/Grid';
import { data } from '@/src/components/Grid/Grid.examples';
import { Stack } from '@/src/components/Stack';
import type { ComponentDemo } from '../../../_components/Demo';
import { demoFactory } from '../../../_components/demoPairing';

/**
 * Live previews for the Grid page, each paired with the exact snippet
 * that produces it.
 *
 * The snippets are not written here — `demoFactory` looks them up from
 * `Grid.examples.tsx` by title and throws on a miss, so a renamed
 * example fails the build instead of quietly shipping a demo whose
 * caption has drifted from its code.
 *
 * These previews import from `@/src/components/*` rather than
 * `@mui/material`, so the page exercises the same export path a
 * consumer of `@neoflo/atoms` would take.
 */

/** Filler styling, declared in the snippets as `tile`. */
const tile = {
  p: 2,
  borderRadius: 1,
  bgcolor: 'action.hover',
  textAlign: 'center',
} as const;

const demo = demoFactory(data);

/** The main sequence, in the order the page documents them. */
export const demos: readonly ComponentDemo[] = [
  demo(
    'Basic grid',
    <Grid container spacing={2}>
      <Grid size={8}>
        <Box sx={tile}>size=8</Box>
      </Grid>
      <Grid size={4}>
        <Box sx={tile}>size=4</Box>
      </Grid>
      <Grid size={4}>
        <Box sx={tile}>size=4</Box>
      </Grid>
      <Grid size={8}>
        <Box sx={tile}>size=8</Box>
      </Grid>
    </Grid>
  ),
  demo(
    'Multiple breakpoints',
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, md: 8 }}>
        <Box sx={tile}>xs=6 md=8</Box>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Box sx={tile}>xs=6 md=4</Box>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Box sx={tile}>xs=6 md=4</Box>
      </Grid>
      <Grid size={{ xs: 6, md: 8 }}>
        <Box sx={tile}>xs=6 md=8</Box>
      </Grid>
    </Grid>
  ),
  demo(
    'Row and column spacing',
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid size={6}>
        <Box sx={tile}>1</Box>
      </Grid>
      <Grid size={6}>
        <Box sx={tile}>2</Box>
      </Grid>
      <Grid size={6}>
        <Box sx={tile}>3</Box>
      </Grid>
      <Grid size={6}>
        <Box sx={tile}>4</Box>
      </Grid>
    </Grid>
  ),
  demo(
    'Responsive values',
    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Grid key={n} size={{ xs: 2, sm: 4, md: 4 }}>
          <Box sx={tile}>{n}</Box>
        </Grid>
      ))}
    </Grid>
  ),
  demo(
    'Auto-layout',
    <Grid container spacing={2}>
      <Grid size="grow">
        <Box sx={tile}>size=grow</Box>
      </Grid>
      <Grid size={6}>
        <Box sx={tile}>size=6</Box>
      </Grid>
      <Grid size="grow">
        <Box sx={tile}>size=grow</Box>
      </Grid>
    </Grid>
  ),
  demo(
    'Variable width content',
    <Grid container spacing={2}>
      <Grid size="auto">
        <Box sx={tile}>size=auto</Box>
      </Grid>
      <Grid size={6}>
        <Box sx={tile}>size=6</Box>
      </Grid>
      <Grid size="grow">
        <Box sx={tile}>size=grow</Box>
      </Grid>
    </Grid>
  ),
  demo(
    'Columns',
    <Grid container spacing={2} columns={16}>
      <Grid size={8}>
        <Box sx={tile}>size=8 of 16</Box>
      </Grid>
      <Grid size={8}>
        <Box sx={tile}>size=8 of 16</Box>
      </Grid>
    </Grid>
  ),
  demo(
    'Offset',
    <Grid container spacing={2}>
      <Grid size={4} offset={4}>
        <Box sx={tile}>size=4 offset=4</Box>
      </Grid>
      <Grid size={12}>
        <Box sx={tile}>size=12</Box>
      </Grid>
      <Grid size={3} offset="auto">
        <Box sx={tile}>size=3 offset=auto</Box>
      </Grid>
    </Grid>
  ),
  demo(
    'Nested grid',
    <Grid container spacing={2}>
      <Grid size={6}>
        <Box sx={tile}>size=6</Box>
      </Grid>
      {/* Inherits columns={12} and spacing={2} from the container above. */}
      <Grid container size={6}>
        <Grid size={6}>
          <Box sx={tile}>nested size=6</Box>
        </Grid>
        <Grid size={6}>
          <Box sx={tile}>nested size=6</Box>
        </Grid>
      </Grid>
    </Grid>
  ),
];

/**
 * Shown inside the Limitations section rather than the main sequence: it
 * documents what to do instead of a prop value Grid does not accept, not
 * a feature Grid has.
 */
export const verticalDemo: ComponentDemo = demo(
  'Vertical layouts use Stack',
  <Grid container spacing={2}>
    <Grid size={4}>
      <Stack spacing={2}>
        <Box sx={tile}>Column 1 - Row 1</Box>
        <Box sx={tile}>Column 1 - Row 2</Box>
        <Box sx={tile}>Column 1 - Row 3</Box>
      </Stack>
    </Grid>
    <Grid size={8}>
      <Box sx={{ ...tile, height: '100%', boxSizing: 'border-box' }}>
        Column 2
      </Box>
    </Grid>
  </Grid>
);
