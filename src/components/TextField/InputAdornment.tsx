/**
 * `InputAdornment` — MUI's adornment slot, re-exported unchanged.
 *
 * What goes in a field's `startAdornment` or `endAdornment` when the
 * thing going there is decorative: a currency symbol, a unit, a search
 * or lock glyph. It positions the content inside the field's border and
 * keeps it out of the input's own text flow.
 *
 * Interactive controls do not need it — an `IconButton` can go straight
 * into either slot, and `TextField` styles it correctly in both cases
 * (see the selector pair in `TextField.tsx`). Reach for this when the
 * content is not a control.
 *
 * ## Why this is a re-export, not a wrapper
 *
 * This takes the carve-out documented in `src/index.ts`, on the same two
 * grounds as `Box`, `CardMedia`, and the motion primitives:
 *
 * 1. **There is nothing left to brand.** The adornment renders a
 *    positioning box and no visual value of its own — the field it sits
 *    in supplies all of them. `TextField` paints
 *    `.MuiInputAdornment-root` with `text.default.caption` and resets
 *    MUI's margin and height through `adornmentBox()`; the pickers do
 *    the same through `_shared/pickerStyles.tsx`. A wrapper here would
 *    have nothing to add that the parent has not already said, and its
 *    props are DOM and layout concepts rather than Material vocabulary:
 *    `position` is `'start' | 'end'`, and the rest are
 *    `disablePointerEvents`, `disableTypography`, `component`, `sx`.
 * 2. **Wrapping it would cost capability.** Those parent styles key off
 *    `.MuiInputAdornment-root`, so any wrapper has to render MUI's
 *    component and keep its class regardless — which makes the wrapper a
 *    layer that changes nothing while standing between the consumer and
 *    a slot API that already works.
 *
 * ## Why it is exported at all
 *
 * Because the alternative was worse. Until this export existed, a field
 * with a decorative icon could only be written by importing from
 * `@mui/material` — and this library's own examples told people to do
 * exactly that, in the same breath as the installation guide telling
 * them not to. One MUI import in a screen is how the second one gets
 * waved through.
 *
 * @example A search field
 * <TextField
 *   label="Search"
 *   startAdornment={
 *     <InputAdornment position="start">
 *       <MagnifyingGlassIcon size={16} />
 *     </InputAdornment>
 *   }
 * />
 *
 * @example A unit at the end
 * <TextField
 *   label="Weight"
 *   endAdornment={<InputAdornment position="end">kg</InputAdornment>}
 * />
 *
 * @see Related: `TextField` for the field itself, `IconButton` for an
 * adornment that does something when clicked.
 */
export { InputAdornment } from '@mui/material';
