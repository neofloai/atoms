import { Box } from '@/src/components/Box';
import { Container } from '@/src/components/Container';
import { data } from '@/src/components/Container/Container.examples';
import { Grid } from '@/src/components/Grid';
import { Stack } from '@/src/components/Stack';
import type { ComponentDemo } from '../../../_components/Demo';
import { demoFactory } from '../../../_components/demoPairing';

/**
 * Live previews for the Container page, each paired with the exact
 * snippet that produces it.
 *
 * The snippets are not written here — `demoFactory` looks them up from
 * `Container.examples.tsx` by title and throws on a miss, so a renamed
 * example fails the build instead of quietly shipping a demo whose
 * caption has drifted from its code.
 *
 * These previews import from `@/src/components/*` rather than
 * `@mui/material`, so the page exercises the same export path a
 * consumer of `@neoflo/atoms` would take.
 *
 * A caveat the previews cannot escape: they render inside the docs
 * column, which is ~712px wide. That is narrower than `md`, `lg`, and
 * `xl`, so only the `sm` and unbounded demos can show a bound taking
 * effect. The demos below are chosen to stay honest at that width.
 */

/** Filler styling, declared in the snippets as `panel`. */
const panel = {
  p: 2,
  borderRadius: 1,
  bgcolor: 'action.hover',
  textAlign: 'center',
} as const;

/**
 * Outlines the space each Container was given, so the bound and the
 * gutters are legible against it. A dashed rule rather than a fill:
 * the tint steps available here differ by too few greyscale levels to
 * read at a 24px inset, in either colour scheme.
 */
const band = {
  borderRadius: 1,
  border: '1px dashed',
  borderColor: 'text.disabled',
} as const;

const demo = demoFactory(data);

/** The main sequence, in the order the page documents them. */
export const demos: readonly ComponentDemo[] = [
  demo(
    'Fluid',
    <Box sx={band}>
      <Container maxWidth="sm">
        <Box sx={panel}>maxWidth=sm — 600px, then centred</Box>
      </Container>
    </Box>
  ),
  demo(
    'Fixed',
    <Box sx={band}>
      <Container fixed>
        <Box sx={panel}>fixed</Box>
      </Container>
    </Box>
  ),
  demo(
    'Gutters',
    <Stack spacing={2}>
      <Box sx={band}>
        <Container maxWidth={false}>
          <Box sx={panel}>default gutters</Box>
        </Container>
      </Box>
      <Box sx={band}>
        <Container maxWidth={false} disableGutters>
          <Box sx={panel}>disableGutters</Box>
        </Container>
      </Box>
    </Stack>
  ),
  demo(
    'Unbounded width',
    <Box sx={band}>
      <Container maxWidth={false}>
        <Box sx={panel}>unbounded — still guttered</Box>
      </Container>
    </Box>
  ),
  demo(
    'Full-bleed background',
    <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 4 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          The colour spans the width. The content does not.
        </Box>
      </Container>
    </Box>
  ),
  demo(
    'Page shell',
    <Container component="section" maxWidth="sm">
      <Stack spacing={3}>
        <Box sx={panel}>Header</Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Box sx={panel}>Main</Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={panel}>Sidebar</Box>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  ),
];

/**
 * Shown inside the Limitations section rather than the main sequence:
 * it documents a way Container behaves badly when misused, not a
 * feature it has.
 */
export const nestedDemo: ComponentDemo = demo(
  'Nested containers double the gutters',
  <Stack spacing={2}>
    {/* 24px from each Container: 48px of gutter. */}
    <Box sx={band}>
      <Container maxWidth="sm">
        <Container>
          <Box sx={panel}>nested — 48px</Box>
        </Container>
      </Container>
    </Box>
    {/* The fix, when the nesting is unavoidable. */}
    <Box sx={band}>
      <Container maxWidth="sm">
        <Container disableGutters>
          <Box sx={panel}>nested — 24px</Box>
        </Container>
      </Container>
    </Box>
  </Stack>
);
