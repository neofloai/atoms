/**
 * `Grid` — MUI's responsive layout grid, re-exported unchanged.
 *
 * The third component to take the "wrap, never re-export" carve-out
 * documented in `src/index.ts`, on the same two grounds as `Box` and
 * `Stack`:
 *
 * 1. **There is nothing to brand.** Grid has the largest prop surface of
 *    the three primitives — `container`, `size`, `offset`, `spacing`,
 *    `rowSpacing`, `columnSpacing`, `columns`, `direction`, `wrap` — but
 *    every one of them names either a CSS concept (`direction`, `wrap`),
 *    a token-scale index (`spacing={2}` resolves to 16px through
 *    `theme.spacing`), or column arithmetic against a count the layout
 *    itself declares (`size`, `offset`, `columns`). None of them names a
 *    colour, a type style, a border, or a state, so there is no MUI
 *    vocabulary to correct and nothing a designer could redline.
 *
 * 2. **Wrapping it would remove capability.** Grid is typed as
 *    `OverridableComponent<GridTypeMap>`, the same polymorphic shape as
 *    Box and Stack, so re-declaring it through `forwardRef` would
 *    collapse the generic and drop element-specific props —
 *    `component="ul"` would stop accepting the props of a list.
 *
 * One system-level decision *is* available here and is deliberately not
 * taken, exactly as `useFlexGap` is left alone on Stack: `columns`
 * defaults to `12`. A column count is the one genuine design decision in
 * Grid's API, and if Neoflo's grid is not twelve columns then
 * `MuiGrid.defaultProps.columns` in `src/theme/index.ts` is the single
 * place to say so. The token set defines no column count today, so this
 * re-export keeps MUI's 12 — which is also the near-universal
 * convention — rather than inventing one as a side effect of adding the
 * component.
 *
 * Note for anyone porting code written against MUI v5 or v6: this is the
 * component that used to be `Grid2`. There is no `item` prop and no
 * `xs` / `md` breakpoint props — `size={{ xs: 12, md: 6 }}` replaces
 * them — and spacing is applied with the CSS `gap` property rather than
 * the negative margins the old implementation used, so none of the
 * overflow workarounds that pattern needed apply here.
 *
 * Consequently the full MUI prop surface applies here verbatim; see
 * `Grid.types.ts`. MUI's own module carries the `'use client'`
 * directive, so the client boundary travels with the re-export and this
 * file deliberately does not add one — Grid stays renderable from a
 * React Server Component, as MUI intends.
 *
 * @example A container of items sized per breakpoint
 * <Grid container spacing={2}>
 *   <Grid size={{ xs: 12, md: 6 }}>…</Grid>
 *   <Grid size={{ xs: 12, md: 6 }}>…</Grid>
 * </Grid>
 *
 * @see Related: `Stack` for one-dimensional layout, and for the vertical
 * stacking Grid deliberately does not support; `Box` for a real
 * two-dimensional CSS Grid, which is what row spanning and auto
 * placement need.
 */
export { Grid } from '@mui/material';
