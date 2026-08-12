import type {
  ToggleButtonGroupProps as MuiToggleButtonGroupProps,
  ToggleButtonProps as MuiToggleButtonProps,
} from '@mui/material';

/**
 * Public API for the toggle family — `ToggleButton` and
 * `ToggleButtonGroup`, the two components MUI documents on one page.
 *
 * MUI's prop surface survives whole; three props are renamed and one is
 * added.
 *
 * ## Renamed
 *
 * - `color` takes the house role names. MUI's neutral role is called
 *   `standard`; here it is `secondary`, matching `Badge` and `Progress`,
 *   and MUI's `info` is `information`. Note what `color` means on this
 *   component: MUI documents it as "the color of the button when it is
 *   in an active state", and its own styles only reach the selected
 *   state — an unselected toggle is neutral whatever `color` says. That
 *   is mirrored here rather than corrected.
 * - `size` is `sm` / `md` rather than `small` / `medium`, per the house
 *   naming convention.
 * - `appearance` replaces the Figma component's `border` boolean — see
 *   below.
 *
 * ## Dropped
 *
 * MUI's `size="large"`. The Figma component set (node 3763:4790) draws
 * two sizes and no third, so there is no 44px toggle to name. `Chip`
 * has the same two-value ladder for the same reason. See
 * DESIGNER_QUESTIONS.md #37.
 *
 * ## Added
 *
 * `appearance`, which is the Figma `border` axis under the house name
 * for that axis. `Button`, `IconButton`, and `Chip` all call the
 * "how much chrome does this control carry" axis `appearance`, so this
 * reuses that word instead of introducing a `border` or `disableBorder`
 * prop of its own. Figma ships exactly two of the three house values —
 * `outline` (the bordered toggle and every grouped toggle) and `text`
 * (the borderless toggle used inside the floating toolbar sample). MUI
 * expresses the same thing by restyling the group, which is what its
 * own "Customized dividers" demo does; this makes it a prop so the
 * toolbar does not need a `styled()` call at every call site.
 */

/**
 * Colour role of the *selected* state. `secondary` is the neutral
 * treatment and the default — the only role the Figma component set
 * draws. See `toggleButtonTokens.ts` for where the other five get their
 * values.
 */
export type ToggleButtonColor =
  | 'secondary'
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'information';

/**
 * Control size. `md` is a 36px box with a 20px glyph, `sm` is 32px with
 * 16px — both from node 3763:4790, and both the same heights
 * `IconButton` and the `Chip` pill use.
 */
export type ToggleButtonSize = 'sm' | 'md';

/**
 * How much chrome the control carries at rest. `outline` draws the 1px
 * neutral border; `text` draws none and relies on the selected fill
 * alone, which is how the toolbar sample stacks toggles beside a
 * divider.
 */
export type ToggleButtonAppearance = 'outline' | 'text';

/**
 * `ToggleButton` props. Everything not listed here is MUI's, unchanged:
 * `value` (required, and how a group identifies which button changed),
 * `selected`, `onChange`, `onClick`, `disabled`, `fullWidth`,
 * `disableRipple`, `disableFocusRipple`, plus `sx` / `classes` /
 * `component` and the rest of `ButtonBase`.
 */
export interface ToggleButtonProps
  extends Omit<MuiToggleButtonProps, 'color' | 'size'> {
  /**
   * Colour of the selected state.
   *
   * Inherited from a parent `ToggleButtonGroup` when not set here.
   *
   * @default 'secondary'
   */
  color?: ToggleButtonColor;
  /**
   * Control size.
   *
   * Inherited from a parent `ToggleButtonGroup` when not set here.
   *
   * @default 'md'
   */
  size?: ToggleButtonSize;
  /**
   * Resting chrome.
   *
   * Inherited from a parent `ToggleButtonGroup` when not set here.
   *
   * @default 'outline'
   */
  appearance?: ToggleButtonAppearance;
}

/**
 * `ToggleButtonGroup` props. MUI's selection model is untouched:
 * `value` + `onChange(event, value)`, with `exclusive` deciding whether
 * `value` is one item or an array, `orientation` for the vertical
 * stack, and `fullWidth` / `disabled` behaving as documented.
 *
 * `color`, `size`, and `appearance` set the default for every child.
 * MUI already passes `color` and `size` down through its own context;
 * this component adds `appearance` to that flow, and a child's own prop
 * always wins over the group's — MUI's own precedence rule.
 */
export interface ToggleButtonGroupProps
  extends Omit<MuiToggleButtonGroupProps, 'color' | 'size'> {
  /**
   * Colour of the selected state, for every child.
   *
   * @default 'secondary'
   */
  color?: ToggleButtonColor;
  /**
   * Control size, for every child.
   *
   * @default 'md'
   */
  size?: ToggleButtonSize;
  /**
   * Resting chrome, for every child. `text` also spaces the children
   * 4px apart and gives each one its own corners back, since there are
   * no borders left to share.
   *
   * @default 'outline'
   */
  appearance?: ToggleButtonAppearance;
}
