/**
 * `CardMedia` — MUI's card media region, re-exported unchanged.
 *
 * The full-bleed strip under the text in Figma's `image` cells (nodes
 * 3653:30108 and 3653:30104). It takes the "wrap, never re-export"
 * carve-out documented in `src/index.ts`, on the same grounds as `Box`
 * and `Container`: measured against the design there is nothing left to
 * add.
 *
 * Figma draws the region as a full-width box of a fixed height holding an
 * `object-fit: cover` image. MUI's `CardMedia` with `component="img"`
 * resolves to `display: block`, `width: 100%`, `object-fit: cover` —
 * the same three declarations, from MUI's own defaults. It renders no
 * colour, no type, no border, and no state; the corners come from the
 * parent `Card`'s `overflow: hidden`, and the inset is zero by design,
 * so it has no padding to take off the spacing scale either.
 *
 * Two Figma values are deliberately *not* carried:
 *
 *   - **the height.** 124px in the `text` cell and 132px in the `info`
 *     one — two different numbers for the same region, neither on any
 *     token ladder, which is what a content dimension looks like. The
 *     caller sets it: `sx={{ height: 124 }}`.
 *   - **the `#d9d9d9` fill** behind each image. That is Figma's own
 *     placeholder rectangle showing through an image fill, not a
 *     specified colour — no variable is bound to it, and it appears
 *     nowhere else in the system.
 *
 * One behaviour is worth knowing because the type does not reveal it:
 * with the `image` prop (a CSS `background-image`) rather than
 * `component="img"`, the region has no intrinsic height and collapses to
 * 0px. A background-image `CardMedia` always needs an explicit height. A
 * `component="img"` one does not, though the design gives it one anyway.
 *
 * MUI's own module carries the `'use client'` directive, so the client
 * boundary travels with the re-export and this file deliberately does
 * not add one.
 *
 * @example The Figma cell: media under the text, edge to edge
 * <Card>
 *   <CardHeader title="Lizards" subheader="Over 6,000 species." />
 *   <CardMedia
 *     component="img"
 *     src="/lizard.jpg"
 *     alt="A saltwater crocodile in shallow water"
 *     sx={{ height: 124 }}
 *   />
 * </Card>
 *
 * @example As a background, which must be given a height
 * <CardMedia image="/lizard.jpg" sx={{ height: 124 }} role="presentation" />
 *
 * @see Related: `Card` for the shell that clips it; `CardContent` for
 * text below it, which keeps its full top padding rather than butting
 * against the image.
 */
export { CardMedia } from '@mui/material';
