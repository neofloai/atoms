/**
 * `Fade` — MUI's opacity transition, re-exported unchanged.
 *
 * Animates a single child between `opacity: 0` and `opacity: 1` when
 * `in` flips. It is the quietest transition in the set and the right
 * default for anything that appears in place: a backdrop, an inline
 * message, an image that has finished loading.
 *
 * ## Why this is a re-export, not a wrapper
 *
 * This takes the carve-out documented in `src/index.ts`, on the same
 * two grounds as `Box`, `Stack`, `Grid`, and `Container`:
 *
 * 1. **There is nothing to brand.** A transition renders no colour, no
 *    type, no border, no surface — it renders no DOM of its own at all.
 *    It clones its child and animates the child's `style`. There is no
 *    MUI vocabulary to rename, because the entire API is `in`,
 *    `timeout`, and `easing`: a boolean, a number of milliseconds, and
 *    a CSS timing function. None of those is a Material word.
 * 2. **Wrapping it would remove capability.** The timing defaults are
 *    read from `theme.transitions` *at render time*, so a re-export
 *    already picks up Neoflo's theme — and would pick up a consumer's
 *    theme too. Freezing a `timeout` into a wrapper would replace a
 *    themeable default with a hardcoded one, which is the opposite of
 *    what a design system should do with motion.
 *
 * ## Where the timings come from
 *
 * `theme.transitions.duration` — `enteringScreen` (225ms) on the way
 * in, `leavingScreen` (195ms) on the way out. Those are MUI's Material
 * values, not Neoflo's: the design library specifies no motion, so
 * nothing was invented here. See `DESIGNER_QUESTIONS.md` #25.
 *
 * ## Reduced motion
 *
 * Honoured automatically. `src/theme/index.ts` sets
 * `motion: { reducedMotion: 'system' }`, so under
 * `prefers-reduced-motion: reduce` this transition completes instantly
 * instead of animating. The state change still happens — only the
 * tween is dropped. Pass `disablePrefersReducedMotion` to opt a single
 * transition out, which is almost never right.
 *
 * ## The child has to hold a ref and accept `style`
 *
 * The transition works by writing `opacity` and `transition` onto the
 * child's `style` and measuring the node. A DOM element, any Atoms
 * component, or any `forwardRef` component works. A function component
 * that drops `ref` or `style` will silently not animate — wrap it in a
 * `<Box>` or `<div>` if you do not control it.
 *
 * @example Fading in a message
 * <Fade in={submitted}>
 *   <Alert severity="success">Invite sent.</Alert>
 * </Fade>
 *
 * @example Removing the node when hidden
 * <Fade in={open} unmountOnExit>
 *   <Box sx={{ p: 2 }}>Details</Box>
 * </Fade>
 *
 * @see Related: `Grow` and `Zoom` for scale, `Slide` for movement,
 * `Collapse` for a transition that reflows the page instead of
 * animating over it.
 */
export { Fade } from '@mui/material';
