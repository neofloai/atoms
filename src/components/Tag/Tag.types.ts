import type { ReactElement } from 'react';
import type { ChipProps as MuiChipProps } from '@mui/material';
import type { ModeToken } from '@/src/tokens';

/**
 * Colour role of the tag. Eight of them, named by meaning rather than
 * by hue, so a status is picked for what it says: `secondary` is the
 * grey, `warning` the yellow, `success` the green, `error` the red and
 * `information` the blue. `orange` and `purple` have no meaning of their
 * own and are for categories, not statuses.
 */
export type TagVariant =
  | 'secondary'
  | 'primary'
  | 'warning'
  | 'purple'
  | 'success'
  | 'orange'
  | 'error'
  | 'information';

/**
 * `contained` is the flat swatch; `outline` draws a 1px border in the
 * role's own border colour over the same fill.
 */
export type TagAppearance = 'contained' | 'outline';

/** Tag height: `sm` = 18px, `md` = 20px. */
export type TagSize = 'sm' | 'md';

/**
 * One colour on a `Tag`: a design token, which resolves per colour
 * scheme, or a plain CSS colour, which does not.
 */
export type TagColorValue = ModeToken | string;

/**
 * The three colours a tag paints, for `Tag`'s `colors` prop. Each is
 * optional and falls back to the `variant`'s own.
 */
export interface TagColors {
  /** The fill. */
  bg?: TagColorValue;
  /** The outline. Only visible with `appearance="outline"`. */
  border?: TagColorValue;
  /** The label, and any glyph that inherits `currentColor`. */
  text?: TagColorValue;
}

/**
 * Props for the Neoflo `Tag`.
 *
 * Extends MUI's `ChipProps` minus the props we remap (`variant`,
 * `size`, `color`) and the ones that would make it a control. A tag is
 * a label, not a button, so `onClick`, `onDelete`, `deleteIcon`,
 * `clickable`, `avatar` and `disabled` are not accepted. `label`,
 * `icon`, `component` and `sx` pass through.
 */
export interface TagProps
  extends Omit<
    MuiChipProps,
    | 'variant'
    | 'size'
    | 'color'
    | 'onClick'
    | 'onDelete'
    | 'deleteIcon'
    | 'clickable'
    | 'avatar'
    | 'disabled'
  > {
  /** Colour role. @default 'primary' */
  variant?: TagVariant;
  /** Visual emphasis. @default 'contained' */
  appearance?: TagAppearance;
  /** Tag height. @default 'md' */
  size?: TagSize;
  /**
   * A 12px glyph after the label, the trailing twin of `icon`. Like
   * `icon` it inherits the label's colour.
   */
  endIcon?: ReactElement;
  /**
   * The three colours of a tag, overriding whatever `variant` would
   * paint. Every key is optional — pass one and the other two still come
   * from the role.
   *
   * This is the escape hatch for a status that the roles do not have a
   * colour for. A value can be a design token, which is a
   * `{ light, dark }` pair and resolves per scheme, or a plain CSS
   * colour, which is used in both. **Prefer a token.** A bare hex is
   * light-mode only by definition, so it paints the same colour on a
   * near-black page.
   *
   * `border` only shows with `appearance="outline"`.
   *
   * @example A status the roles have no colour for
   * <Tag
   *   appearance="outline"
   *   label="Extraction"
   *   colors={{
   *     bg: surface.information.subtle,
   *     border: border.information.default,
   *     text: text.information[3],
   *   }}
   * />
   *
   * @default undefined
   */
  colors?: TagColors;
}
