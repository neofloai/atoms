/**
 * `Box` — MUI's layout primitive, re-exported unchanged.
 *
 * This is the one deliberate exception to the "wrap, never re-export"
 * rule in `src/index.ts`, on two grounds:
 *
 * 1. **There is nothing to brand.** Box renders a bare `<div>` with no
 *    colour, type, spacing, border, or state of its own, so there is no
 *    MUI vocabulary to rename and no Neoflo API to put on the outside.
 *    It is already on-brand by construction: `sx` resolves against the
 *    token-built theme, so `sx={{ p: 2, bgcolor: 'background.paper' }}`
 *    picks up our spacing scale and palette without the component
 *    knowing anything about either.
 *
 * 2. **Wrapping it would remove capability.** MUI types Box as
 *    `OverridableComponent<BoxTypeMap<…>>`, which is what makes
 *    `component` polymorphic: `component="a"` narrows the remaining
 *    props to anchor props, so `href` is typed and a typo is caught.
 *    Re-declaring it through `forwardRef` collapses that generic to one
 *    element type and silently drops every element-specific prop — a
 *    real loss for a primitive whose whole job is to become other
 *    elements.
 *
 * Consequently the full MUI prop surface applies here verbatim; see
 * `Box.types.ts`. MUI's own module carries the `'use client'`
 * directive, so the client boundary travels with the re-export and
 * this file deliberately does not add one — Box stays renderable from
 * a React Server Component, as MUI intends.
 *
 * @example Spacing and surface from the theme
 * <Box sx={{ p: 2, bgcolor: 'background.paper' }}>…</Box>
 *
 * @example Any element or component, with its own props still typed
 * <Box component="section" sx={{ display: 'flex', gap: 2 }}>…</Box>
 *
 * @see Related: Stack and Container (MUI) for one-dimensional and
 * page-level layout; Paper for an elevated surface.
 */
export { Box } from '@mui/material';
