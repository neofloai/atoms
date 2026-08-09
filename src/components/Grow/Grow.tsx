/**
 * `Grow` — MUI's scale-and-fade transition, re-exported unchanged.
 *
 * Expands a child from a small, transparent state to its full size and
 * opacity. It is the transition Material uses for things that come
 * *out of* something else — a menu out of its button, a tooltip out of
 * its target — which is why MUI's own `Menu`, `Popover`, and `Tooltip`
 * all use it internally, and therefore why Atoms' `Menu` already
 * animates this way without being asked to.
 *
 * ## Why this is a re-export, not a wrapper
 *
 * Same carve-out as `Fade`: a transition renders no DOM of its own and
 * has no Material vocabulary to rename, and its timing defaults resolve
 * from `theme.transitions` at render time — so a re-export is already
 * themed, while a wrapper with baked-in timings would be less themed.
 * See `src/components/Fade/Fade.tsx` for the full reasoning and
 * `src/index.ts` for the rule it takes an exception to.
 *
 * ## `timeout="auto"` is the default, and it is the interesting part
 *
 * Alone among the five transitions, `Grow` defaults to `'auto'`:
 * rather than a fixed duration it measures the child's height and
 * derives a duration from it, so a four-item menu opens faster than a
 * twenty-item one. That is the behaviour you almost always want for a
 * surface that appears at an unpredictable size, and it is the reason
 * to reach for `Grow` over `Zoom` when the content is a panel rather
 * than a control.
 *
 * `'auto'` requires the child to hold a ref and be measurable, so a
 * child with `display: none` or zero height will produce a zero-length
 * transition. Give it a number if you need a fixed duration.
 *
 * ## Reduced motion
 *
 * Honoured automatically via `motion: { reducedMotion: 'system' }` in
 * `src/theme/index.ts` — the child appears at full size instantly
 * under `prefers-reduced-motion: reduce`.
 *
 * @example A panel that grows out of its trigger
 * <Grow in={open}>
 *   <Paper variant="outlined" sx={{ p: 2 }}>Filters</Paper>
 * </Grow>
 *
 * @example Staggering a list, in and out
 * {items.map((item, index) => (
 *   <Grow
 *     key={item.id}
 *     in={open}
 *     timeout={{ enter: 200 + index * 60, exit: 150 }}
 *   >
 *     <Chip label={item.label} />
 *   </Grow>
 * ))}
 *
 * @see Related: `Zoom` for a pure scale with a fixed duration, `Fade`
 * for opacity alone, `Menu` — which already uses this transition.
 */
export { Grow } from '@mui/material';
