/**
 * `Container` — MUI's page-width container, re-exported unchanged.
 *
 * The fourth component to take the "wrap, never re-export" carve-out
 * documented in `src/index.ts`, on the same two grounds as `Box`,
 * `Stack`, and `Grid`:
 *
 * 1. **There is nothing to brand.** The whole API is `maxWidth`,
 *    `fixed`, and `disableGutters`. `maxWidth="sm"` is an index into
 *    the theme's breakpoint scale in exactly the way `spacing={2}` is
 *    an index into the spacing scale — it resolves to whatever Neoflo's
 *    theme says `sm` is, so the value written is already ours — and the
 *    other two switch between CSS behaviours. Nothing here names a
 *    colour, a type style, a border, or a state. A Container is a
 *    width, not a surface: it renders nothing you can see.
 *
 * 2. **Wrapping it would remove capability.** Container is typed as
 *    `OverridableComponent<ContainerTypeMap>`, the same polymorphic
 *    shape as the other three, so re-declaring it through `forwardRef`
 *    would collapse the generic and drop element-specific props. That
 *    matters more here than elsewhere, because `component="main"` — or
 *    `section`, `header`, `footer` — is the *usual* way to write a
 *    Container, not an edge case.
 *
 * As with Grid's `columns`, system-level decisions are available here
 * and are deliberately not taken. Container ships two numbers that are
 * MUI's rather than Neoflo's:
 *
 *   - `maxWidth` defaults to `'lg'`, so an unqualified Container is
 *     1200px wide. A product's page width is a design decision.
 *   - the gutters are `theme.spacing(2)` below `sm` and
 *     `theme.spacing(3)` from `sm` up — 16px and 24px. Those steps come
 *     off the Neoflo spacing scale, but *which* steps they are is MUI's
 *     choice.
 *
 * `MuiContainer.defaultProps.maxWidth` and
 * `MuiContainer.styleOverrides.root` in `src/theme/index.ts` are the
 * single places to change either. The token set defines no page width
 * and no gutter today, so this re-export keeps MUI's rather than
 * inventing them as a side effect of adding the component.
 *
 * One behaviour is worth knowing because the type does not reveal it:
 * `maxWidth="xs"` is not the `xs` breakpoint. That breakpoint is `0`,
 * so MUI clamps it — `Math.max(theme.breakpoints.values.xs, 444)` — and
 * the container comes out 444px wide. Every other value is the
 * breakpoint itself.
 *
 * Consequently the full MUI prop surface applies here verbatim; see
 * `Container.types.ts`. MUI's own module carries the `'use client'`
 * directive, so the client boundary travels with the re-export and this
 * file deliberately does not add one — Container stays renderable from
 * a React Server Component, as MUI intends.
 *
 * @example A page shell
 * <Container component="main" maxWidth="md">
 *   <Stack spacing={4}>…</Stack>
 * </Container>
 *
 * @example Full-bleed colour, bounded content
 * <Box sx={{ bgcolor: 'primary.main' }}>
 *   <Container>…</Container>
 * </Box>
 *
 * @see Related: `Box` for a surface or for `mx: 'auto'` on its own;
 * `Grid` for dividing the width a Container establishes; `Stack` for
 * the vertical rhythm inside it.
 */
export { Container } from '@mui/material';
