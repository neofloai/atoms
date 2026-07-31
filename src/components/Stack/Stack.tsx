/**
 * `Stack` — MUI's one-dimensional layout primitive, re-exported unchanged.
 *
 * The second component to take the "wrap, never re-export" carve-out
 * documented in `src/index.ts`, on the same two grounds as `Box`:
 *
 * 1. **There is nothing to brand.** Stack does have props of its own,
 *    unlike Box — `direction`, `spacing`, `divider`, `useFlexGap` — but
 *    none of them names a design decision. `direction="row"` is CSS
 *    vocabulary rather than MUI vocabulary, so there is nothing to
 *    rename; and `spacing={2}` is an index into the theme's spacing
 *    scale, so the numbers a consumer writes are already Neoflo's. A
 *    wrapper would only put a second name on a CSS property.
 *
 * 2. **Wrapping it would remove capability.** Stack is typed as
 *    `OverridableComponent<StackTypeMap>`, the same polymorphic shape as
 *    Box, so re-declaring it through `forwardRef` would collapse the
 *    generic and drop element-specific props — `component="ul"` would
 *    stop accepting the props of a list, and `component="nav"` would
 *    stop being distinguishable from a `<div>` to the type checker.
 *
 * One system-level decision *is* available here and is deliberately not
 * taken: `useFlexGap` defaults to `false`, which spaces children with
 * margins and therefore silently ignores any margin set on those
 * children. Flipping the default to `true` through
 * `MuiStack.defaultProps` would remove that footgun for every consumer
 * at once, at the cost of older-browser support. That is a call for the
 * design system to make deliberately, not a side effect of adding the
 * component, so this re-export keeps MUI's default and the docs page
 * documents the limitation instead.
 *
 * Consequently the full MUI prop surface applies here verbatim; see
 * `Stack.types.ts`. MUI's own module carries the `'use client'`
 * directive, so the client boundary travels with the re-export and this
 * file deliberately does not add one — Stack stays renderable from a
 * React Server Component, as MUI intends.
 *
 * @example Vertical by default, spaced from the token scale
 * <Stack spacing={2}>…</Stack>
 *
 * @example Horizontal, responsive, and semantic
 * <Stack component="nav" direction={{ xs: 'column', sm: 'row' }} spacing={2}>…</Stack>
 *
 * @see Related: `Box` for two-dimensional layout (flex or grid), for
 * per-child alignment, and for anything that is a surface rather than an
 * arrangement.
 */
export { Stack } from '@mui/material';
