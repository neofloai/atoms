/**
 * `Collapse` — MUI's size transition, re-exported unchanged.
 *
 * Animates a child's height (or width, with
 * `orientation="horizontal"`) between zero and its natural size. It is
 * the one transition in this set that changes layout: the page reflows
 * around it as it opens, rather than the child animating over the top
 * of everything else. That makes it the correct choice for disclosure
 * — an expanding row, an accordion section, a validation message that
 * pushes the form down — and the wrong choice for anything floating.
 *
 * ## Why this is a re-export, not a wrapper
 *
 * Same carve-out as `Fade` — see `src/components/Fade/Fade.tsx`. This
 * one is the closest call of the five, because `Collapse` does render
 * DOM: three nested `div`s that do the measuring. But they carry no
 * colour, type, border, or spacing — they are `height`, `overflow`,
 * and `min-height` and nothing else — so there is still no brand
 * decision encoded in them and nothing to rename.
 *
 * ## `timeout="auto"` and `collapsedSize`
 *
 * Two props are worth knowing before reaching for a wrapper of your
 * own:
 *
 *   - `timeout="auto"` derives the duration from the child's height,
 *     so a two-line disclosure is quicker than a twenty-line one. It
 *     is not the default here (the default is
 *     `theme.transitions.duration.standard`, 300ms) but it usually
 *     should be, for the same reason it is `Grow`'s.
 *   - `collapsedSize` is the height when closed. Set it to leave a
 *     preview line visible instead of collapsing to nothing — a
 *     "read more" that shows the first line is `collapsedSize={24}`,
 *     not a separate component.
 *
 * ## Reduced motion
 *
 * Honoured automatically via `motion: { reducedMotion: 'system' }` in
 * `src/theme/index.ts`.
 *
 * ## Accessibility
 *
 * `Collapse` manages size, not semantics. A disclosure still needs its
 * trigger wired to it: `aria-expanded` on the control and
 * `aria-controls` pointing at the collapsing region's `id`. Without
 * that, a screen reader user gets a button with no stated effect and a
 * region that appears with no announcement. Pair it with
 * `unmountOnExit` so the hidden content is out of the accessibility
 * tree entirely rather than present at zero height.
 *
 * @example A disclosure, wired up
 * <Button
 *   onClick={() => setOpen(!open)}
 *   aria-expanded={open}
 *   aria-controls="billing-details"
 * >
 *   {open ? 'Hide details' : 'Show details'}
 * </Button>
 * <Collapse in={open} timeout="auto" unmountOnExit>
 *   <Box id="billing-details" sx={{ pt: 2 }}>…</Box>
 * </Collapse>
 *
 * @example Keeping the first line visible when closed
 * <Collapse in={expanded} collapsedSize={24}>
 *   <Typography variant="body2">{article.body}</Typography>
 * </Collapse>
 *
 * @see Related: `Fade` and `Grow` for content that appears over the
 * page rather than within it; `Alert`, which is commonly the child
 * here.
 */
export { Collapse } from '@mui/material';
