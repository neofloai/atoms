'use client';

import { Divider as MuiDivider } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { DividerTypeMap } from './Divider.types';

/**
 * A hairline rule that separates content. Wraps MUI `Divider` and draws
 * the thin line between sections of a page, groups in a menu, or items
 * in a row — horizontally by default, vertically with
 * `orientation="vertical"`, and with a label in the middle when given
 * children.
 *
 * Every MUI prop survives, because there is almost nothing to rename.
 * `orientation`, `flexItem`, and `textAlign` name CSS concepts rather
 * than Material jargon, and `children` / `component` / `sx` / `classes`
 * behave exactly as documented for MUI `Divider`.
 *
 * ## No Figma source
 *
 * Like `Skeleton` and the motion primitives, this one has no design to
 * sync against: searching the Product Design System for a divider,
 * separator, rule, or line returns component sets for arithmetic
 * (`MathOperations`, `Calculator`, `Minus`) and nothing else. So the
 * one visual value below was not transcribed from a spec — it was
 * derived from the border tokens the designer did author, and it is
 * open to being redlined. See DESIGNER_QUESTIONS.md #26.
 *
 * ## What this wrapper adds
 *
 * One thing: a hairline that is actually visible on every surface in
 * the system. MUI paints the rule from `palette.divider`, which this
 * theme sets to `grey/200` in light and `grey/1000` in dark. The light
 * value is fine. The dark value is not, and the failure is total rather
 * than marginal:
 *
 *   - on `surface.layers.card1` (`grey/1000`, `#171716`) the rule is
 *     *the same colour as the surface* — it does not render at all
 *   - on `card2` (`grey/950`) and `background.paper` (`grey/1050`) it is
 *     darker than what it sits on, so it reads as a smudge rather than
 *     a line
 *
 * This is not a new discovery — `Menu` already hand-patches it for
 * dividers inside a menu panel, and the menu docs page carries a note
 * explaining why. Fixing it once here means the next surface does not
 * have to.
 *
 * The replacement is `border.default.default` — the system's own
 * neutral border token, the same one a `secondary` `outline` Button
 * draws its edge from. `grey/700` (`#43403c`) is lighter than every
 * dark layer in the system and `grey/300` (`#cccac6`) is darker than
 * every light one, so a single token holds on the page, on all three
 * card layers, and on `background.paper` in both colour schemes. Every
 * surface improves — most of all dark `card1` and `paper`, where the
 * rule went from invisible to legible.
 *
 * The bar here is "visible on every surface", which `palette.divider`
 * was failing outright.
 *
 * The one cost is that a light-mode rule moves a rung down the grey
 * scale, `grey/200` to `grey/300` — slightly more present than MUI's
 * default. That is a deliberate trade for having one token that works
 * everywhere instead of two that each work half the time.
 *
 * This is a local fix. The root cause is `palette.divider` itself, and
 * correcting it in `src/theme/palette.ts` would cover `<MenuItem
 * divider />`, MUI's own components, and the docs site in one move —
 * but it would also restyle every existing surface, so it belongs in
 * its own change rather than riding along with a new component.
 *
 * Only the colour is overridden. The width stays on MUI's `thin`, which
 * every browser resolves to 1px, because replacing it would mean
 * restating the horizontal/vertical border-side logic for no visible
 * gain.
 *
 * ## What was deliberately left alone
 *
 * `variant` is the one piece of Material vocabulary here, and its inset
 * geometry is Material's: `inset` is a hardcoded `margin-left: 72px` —
 * the width of a Material list avatar plus its gutter — and `middle` is
 * `theme.spacing(2)`, 16px, a number that is not on the Neoflo spacing
 * scale at all (4, 8, 12, 24, 48, 64, 96). Both were kept rather than
 * quietly re-pointed, for the same reason no motion tokens were
 * invented in DESIGNER_QUESTIONS.md #25: a number chosen here would be
 * indistinguishable from one the designer specified. `fullWidth`, the
 * default, involves no such number and is unaffected.
 *
 * The semantics are MUI's. A plain divider renders `<hr>`; adding
 * children or `orientation="vertical"` switches the root to a `<div>`,
 * which MUI marks as a separator itself.
 *
 * @example Between sections of a page
 * <Divider />
 *
 * @example Between items in a row — vertical needs `flexItem`
 * <Stack direction="row" spacing={2}>
 *   <Typography>Drafts</Typography>
 *   <Divider orientation="vertical" flexItem />
 *   <Typography>Sent</Typography>
 * </Stack>
 *
 * @example Labelled, to name what comes next
 * <Divider textAlign="left">Archived</Divider>
 *
 * @example Inside a list, where a bare `<hr>` would be invalid markup
 * <Stack component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
 *   <Typography component="li">Rename</Typography>
 *   <Divider component="li" />
 *   <Typography component="li">Delete</Typography>
 * </Stack>
 *
 * @see Related: Stack, Menu, MenuItem
 */
const StyledDivider = styled(MuiDivider)(({ theme }) => ({
  // Covers both axes at once: MUI zeroes every border and re-adds a
  // single side (`borderBottomWidth` horizontal, `borderRightWidth`
  // vertical), so colouring all four sides colours whichever one is
  // actually drawn.
  ...paired(theme, { borderColor: border.default.default }),
  // The labelled form draws its two rules on the pseudo-elements
  // instead, and MUI writes them with the `borderTop` / `borderLeft`
  // shorthand — which re-specifies the colour, so the rule above does
  // not reach them.
  '&::before, &::after': paired(theme, {
    borderColor: border.default.default,
  }),
}));

StyledDivider.displayName = 'Divider';

/**
 * Cast to MUI's own declaration shape rather than left as the styled
 * component's inferred type. `styled()` collapses an
 * `OverridableComponent` down to its default-root props and drops
 * `component` altogether: without this cast `<Divider component="li"
 * />` fails with "Property 'component' does not exist" while still
 * rendering an `li` at runtime. Restating the type map keeps the root
 * swappable *and* type-checks the element's own props — the same fix
 * `Skeleton` and `MenuItem` use.
 */
export const Divider = StyledDivider as OverridableComponent<DividerTypeMap>;
