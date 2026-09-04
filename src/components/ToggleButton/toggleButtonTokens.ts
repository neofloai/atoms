import { border, icon, spacing, surface, typography } from '@/src/tokens';

import type {
  ToggleButtonGroupProps as MuiToggleButtonGroupProps,
  ToggleButtonProps as MuiToggleButtonProps,
} from '@mui/material';
import type { ModeToken } from '@/src/tokens';
import type { ToggleButtonColor, ToggleButtonSize } from './ToggleButton.types';

/**
 * Geometry and colour for the toggle family, read off the Product
 * Design System Figma component set (node 3763:4790, read 12 August).
 *
 * `ToggleButton` and `ToggleButtonGroup` share this table so a grouped
 * toggle and a standalone one cannot drift apart.
 */

/** Neoflo colour role -> MUI palette role. */
export const muiColorMap: Record<
  ToggleButtonColor,
  NonNullable<MuiToggleButtonProps['color']>
> = {
  secondary: 'standard',
  primary: 'primary',
  success: 'success',
  error: 'error',
  warning: 'warning',
  information: 'info',
};

/**
 * Neoflo size -> MUI size. Forwarded so MUI keeps emitting its own
 * `.MuiToggleButton-sizeSmall` hooks and a consumer's `classes` or theme
 * overrides keyed on them still land; every value MUI attaches to those
 * sizes is then replaced below.
 */
export const muiSizeMap: Record<
  ToggleButtonSize,
  NonNullable<MuiToggleButtonGroupProps['size']>
> = {
  sm: 'small',
  md: 'medium',
};

/**
 * Padding on all four sides — `Scale/200`, the one spacing value in the
 * component set and the same at both sizes.
 *
 * The 1px border has to come out of this at render time: Figma strokes
 * inside the frame so its 36px symbol measures 36px stroke and all,
 * while a CSS border sits outside the content box. Every toggle
 * reserves the border whether or not it paints it, which is also what
 * keeps `appearance="text"` the same size as `appearance="outline"`.
 * `Chip` makes the same subtraction for the same reason.
 */
export const TOGGLE_PADDING_PX = spacing.component.xs;

/**
 * Glyph size per control size (nodes 3763:4989 and 3763:5037): 20px at
 * `md`, 16px at `sm`. With 8px of padding either side that gives the
 * 36px and 32px boxes the component set draws.
 */
export const glyphSizePx: Record<ToggleButtonSize, number> = {
  md: 20,
  sm: 16,
};

/**
 * Label type per control size.
 *
 * An extrapolation, flagged as such: every symbol in the component set
 * is icon-only, so Figma specifies no label at all. MUI's own first
 * demo is a text toggle, though, and left unstyled it would render at
 * MUI's 13px/15px `button` ramp rather than the house one.
 *
 * The two rungs are picked so a text toggle and an icon toggle measure
 * the same: `b1` leads at 20px, exactly the `md` glyph, and `b2` at
 * 16px, exactly the `sm` glyph. So both forms land on 36px and 32px
 * with the same padding. See DESIGNER_QUESTIONS.md #37.
 *
 * Widened off the `as const` token literals, which type each rung as its
 * own exact numbers and would otherwise refuse to sit in one record.
 */
interface LabelType {
  readonly size: number;
  readonly leading: number;
  readonly letterSpacing: number;
}

export const labelType: Record<ToggleButtonSize, LabelType> = {
  md: typography.body.b1,
  sm: typography.body.b2,
};

/**
 * The border every `outline` toggle draws — `border.layers.card1`,
 * bound on all eight symbols of node 3763:4991.
 *
 * Note this is a *layers* token rather than the `border.default.default`
 * that an outlined Button draws. It is a hairline meant to enclose a
 * group, not to advertise a hit area, and it is the token the sheet
 * names.
 */
export const TOGGLE_BORDER_TOKEN: ModeToken = border.layers.card1;

/** Glyph colour while unselected — `icon/default/subtle`, all roles. */
export const UNSELECTED_INK: ModeToken = icon.default.subtle;

/**
 * Fill under the pointer while unselected, and one rung further while
 * held.
 *
 * Composed, not transcribed: the component set has no hover, pressed,
 * or focus cell — only `on` / `off`. Two things constrain the choice.
 * The selected fill is `surface.layers.card2`, the *first* neutral rung
 * above the page, so there is no lighter fill to put underneath it that
 * would still be visible on the `card 1` surface the toolbar sample
 * uses. And MUI's own ladder overlaps the same way (4% hover, 8%
 * selected, 12% selected-hover) without ever going lighter.
 *
 * So the pointer fill *equals* the selected fill, and selection is
 * carried by the glyph instead: `icon/default/subtle` when off,
 * `icon/default/b1` when on, in every state. Fill says "you are
 * pointing at me"; ink says "I am on". Both rungs stay on the `layers`
 * ladder the sheet already chose, which ascends in prominence in both
 * schemes (grey/100 -> grey/150 in light, grey/950 -> grey/900 in
 * dark). See DESIGNER_QUESTIONS.md #37.
 */
export const HOVER_BG: ModeToken = surface.layers.card2;
export const PRESSED_BG: ModeToken = surface.layers.card3;

interface RoleTokens {
  /** Fill once selected. */
  selectedBg: ModeToken;
  /** Fill once selected, under the pointer or held. */
  selectedBgHover: ModeToken;
  /** Glyph and label colour once selected. */
  selectedInk: ModeToken;
  /** Focus-visible ring, per the house convention for every control. */
  focusRing: ModeToken;
}

/**
 * Selected-state colour per role.
 *
 * `secondary` is the design: `surface.layers.card2` behind
 * `icon/default/b1`, straight off node 3763:4989.
 *
 * The other five have no toggle drawn anywhere in the Figma file, so
 * they are not transcribed — they reuse the pairing `Chip` already
 * ships for a selected `contained` pill: the role's `subtle` fill under
 * its own `caption` ink, moving to `subtleHover` under the pointer.
 * That keeps a coloured toggle recognisably the same object as a
 * coloured chip, and means no new colour decisions were invented here.
 * They exist because MUI documents `color` on this component; the sheet
 * only asks for the neutral one. See DESIGNER_QUESTIONS.md #37.
 *
 * Ink comes from the `icon` group rather than `text` because Figma binds
 * the toggle's glyph to `icon/*` variables. The two groups hold the same
 * value on every accent role as of the 2026-08-11 export.
 */
export const roleTokens: Record<ToggleButtonColor, RoleTokens> = {
  secondary: {
    selectedBg: surface.layers.card2,
    selectedBgHover: surface.layers.card3,
    selectedInk: icon.default.body,
    focusRing: border.default.defaultPressed,
  },
  primary: {
    selectedBg: surface.primary.subtle,
    selectedBgHover: surface.primary.subtleHover,
    selectedInk: icon.primary.caption,
    focusRing: border.primary.focus,
  },
  success: {
    selectedBg: surface.success.subtle,
    selectedBgHover: surface.success.subtleHover,
    selectedInk: icon.success.caption,
    focusRing: border.success.focus,
  },
  error: {
    selectedBg: surface.error.subtle,
    selectedBgHover: surface.error.subtleHover,
    selectedInk: icon.error.caption,
    focusRing: border.error.focus,
  },
  warning: {
    selectedBg: surface.warning.subtle,
    selectedBgHover: surface.warning.subtleHover,
    selectedInk: icon.warning.caption,
    focusRing: border.warning.focus,
  },
  information: {
    selectedBg: surface.information.subtle,
    selectedBgHover: surface.information.subtleHover,
    selectedInk: icon.information.caption,
    focusRing: border.information.focus,
  },
};
