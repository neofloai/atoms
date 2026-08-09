/**
 * `Slide` — MUI's translate transition, re-exported unchanged.
 *
 * Moves a child in from an edge of the screen and back out to it.
 * `direction` names where the child enters *from*, so
 * `direction="up"` starts below the viewport and travels upward — the
 * opposite of what the word suggests on first reading, and the single
 * most common mistake with this component.
 *
 * It is the transition MUI's own `Drawer` uses, and the right one for
 * anything that belongs to an edge: a sheet, a panel, a notification
 * that arrives from the corner.
 *
 * ## Why this is a re-export, not a wrapper
 *
 * Same carve-out as `Fade` — no DOM of its own, no Material vocabulary
 * to rename, timings resolved from `theme.transitions` at render time.
 * See `src/components/Fade/Fade.tsx`.
 *
 * ## It measures the viewport, not its parent
 *
 * The offset is calculated so the child clears the *window* edge. A
 * `Slide` inside a small card will therefore travel the width of the
 * screen, not the width of the card, and will be visible sliding
 * across everything in between unless the parent clips it. Two fixes,
 * both correct depending on intent:
 *
 *   - `sx={{ overflow: 'hidden' }}` on the parent, so the child is
 *     clipped to the container it belongs to; or
 *   - the `container` prop, pointing at that parent, so the offset is
 *     computed from its edges instead of the window's.
 *
 * ## Reduced motion
 *
 * Honoured automatically via `motion: { reducedMotion: 'system' }` in
 * `src/theme/index.ts`. This is the transition where that matters most
 * — a large translate is exactly the kind of movement the OS setting
 * exists to suppress.
 *
 * ## `appear` defaults to true
 *
 * A `Slide` that mounts with `in={true}` animates on first paint. For
 * a panel that should already be open when the page loads, pass
 * `appear={false}` or the user sees it fly in on arrival.
 *
 * @example A panel entering from the right, clipped to its container
 * <Box sx={{ overflow: 'hidden' }}>
 *   <Slide direction="left" in={open} mountOnEnter unmountOnExit>
 *     <Paper variant="outlined" sx={{ p: 2 }}>Details</Paper>
 *   </Slide>
 * </Box>
 *
 * @example A bar rising from the bottom of the page
 * <Slide direction="up" in={hasUnsavedChanges}>
 *   <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2 }}>
 *     <Button variant="primary">Save changes</Button>
 *   </Paper>
 * </Slide>
 *
 * @see Related: `Fade` when the movement is unnecessary, `Collapse`
 * when the surrounding content should reflow rather than be covered.
 */
export { Slide } from '@mui/material';
