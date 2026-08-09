/**
 * `Zoom` — MUI's scale transition, re-exported unchanged.
 *
 * Scales a child from `0` to `1` about its own centre. Where `Grow`
 * also fades and measures its child, `Zoom` is a pure scale on a fixed
 * duration — which makes it the right choice for a small control whose
 * size is already known, and the wrong choice for a panel whose size
 * is not.
 *
 * The canonical use is a floating action button swapped per tab: the
 * outgoing button scales away, the incoming one scales in, and the
 * scale reads as *the same slot changing occupant* rather than as two
 * unrelated appearances.
 *
 * ## Why this is a re-export, not a wrapper
 *
 * Same carve-out as `Fade` — no DOM of its own, no Material vocabulary
 * to rename, timings resolved from `theme.transitions` at render time.
 * See `src/components/Fade/Fade.tsx`.
 *
 * ## Reduced motion
 *
 * Honoured automatically via `motion: { reducedMotion: 'system' }` in
 * `src/theme/index.ts`.
 *
 * ## Swapping two elements without them overlapping
 *
 * A scale-out and a scale-in that run at the same time collide. Delay
 * the entering element by the exiting one's duration — `style={{
 * transitionDelay: exiting ? '0ms' : '195ms' }}` — or give the pair a
 * fixed-size container so the layout does not jump between them. The
 * examples on the docs page show both.
 *
 * @example A control that scales in
 * <Zoom in={hasSelection}>
 *   <IconButton aria-label="Delete selected"><Trash /></IconButton>
 * </Zoom>
 *
 * @example Only animating on state change, not on first paint
 * <Zoom in={active} appear={false}>
 *   <Chip label="Live" />
 * </Zoom>
 *
 * @see Related: `Grow` when the child's size is unpredictable and
 * `timeout="auto"` should measure it; `Fade` when scale would be too
 * much movement.
 */
export { Zoom } from '@mui/material';
