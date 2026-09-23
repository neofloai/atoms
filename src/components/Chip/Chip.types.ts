import type { ChipProps as MuiChipProps } from '@mui/material';
import type { ModeToken } from '@/src/tokens';
import type {
  ActionAppearance,
  ActionVariant,
} from '../_shared/actionStyles';

/**
 * Colour role of the chip. `size="md"` (the 36px pill, node
 * 986:18006) only defines `primary` / `secondary` / `success` /
 * `error` / `warning`, mirroring `ButtonVariant`. `size="sm"` (the
 * 20px flat tag, node 3156:83830) adds `information` / `orange` /
 * `purple`, which have no pill equivalent yet — passing one of those
 * three at `size="md"` falls back to the `secondary` look.
 */
export type ChipVariant = ActionVariant | 'information' | 'orange' | 'purple';

/**
 * Visual emphasis of the chip, mapped from the Figma `filled` axis:
 * `contained` (filled=True) or `outline` (filled=False). Only applies
 * at `size="md"` — the `size="sm"` tag has no outline equivalent in
 * Figma and always renders as a flat swatch.
 */
export type ChipAppearance = Exclude<ActionAppearance, 'text'>;

/**
 * Chip size: `md` = the pill (node 986:18006) — five colour roles,
 * contained/outline emphasis, full interaction states, and two heights
 * via `dense`. `sm` = the 20px flat tag (node 3156:83830) — eight colour
 * roles, no emphasis axis, no interaction states.
 *
 * Figma's pill set carries its own height axis as a `small` boolean
 * rather than a third t-shirt size, and that is mirrored here as `dense`
 * instead of renaming the ramp: inserting a size *between* the existing
 * two would silently change what `sm` or `md` means for every existing
 * call site.
 */
export type ChipSize = 'sm' | 'md';

/**
 * Props for the Neoflo `Chip`.
 *
 * Extends MUI's `ChipProps` minus the props we remap (`variant`,
 * `size`, `color`). Everything else — `label`, `avatar`, `icon`,
 * `deleteIcon`, `onDelete`, `onClick`, `clickable`, `disabled`, `sx` —
 * passes through.
 */
/**
 * One colour on a `Chip`: a design token, which resolves per colour
 * scheme, or a plain CSS colour, which does not.
 */
export type ChipColorValue = ModeToken | string;

/**
 * The three colours a tag paints, for `Chip`'s `colors` prop. Each is
 * optional and falls back to the `variant`'s own.
 */
export interface ChipColors {
  /** The fill. */
  bg?: ChipColorValue;
  /** The outline. Only visible with `bordered`. */
  border?: ChipColorValue;
  /** The label, and any glyph that inherits `currentColor`. */
  text?: ChipColorValue;
}

export interface ChipProps
  extends Omit<MuiChipProps, 'variant' | 'size' | 'color'> {
  /** Colour role. @default 'primary' */
  variant?: ChipVariant;
  /** Visual emphasis. @default 'contained' */
  appearance?: ChipAppearance;
  /** Pill size. @default 'md' */
  size?: ChipSize;
  /**
   * Draws a 1px outline in the role's own border token, over the role's
   * fill — the treatment the status sheet uses in a table's Status
   * column. Every role has one, so a bordered chip is still picked by
   * meaning (`variant="information"`) rather than by colour, and it
   * resolves in both schemes with no hex at the call site.
   *
   * `size="sm"` only. The pill already carries a border on
   * `appearance="outline"`, and stacking a second axis on top of it
   * would give two ways to say one thing.
   *
   * The outline is given back out of the inline padding, so a bordered
   * chip is exactly as wide as a plain one and a column of mixed
   * statuses still lines up.
   *
   * @default false
   */
  bordered?: boolean;

  /**
   * The three colours of a tag, overriding whatever `variant` would
   * paint. `size="sm"` only, and every key is optional — pass one and
   * the other two still come from the role.
   *
   * This is the escape hatch for a status that the semantic roles do
   * not have a colour for. A value can be a design token, which is a
   * `{ light, dark }` pair and resolves per scheme, or a plain CSS
   * colour, which is used in both. **Prefer a token.** A bare hex is
   * light-mode only by definition, so it paints the same colour on a
   * near-black page — which is how the sheet this came from exports,
   * and is not how a component should ship.
   *
   * `border` only shows with `bordered`. Disabled still wins over all
   * three: a switched-off chip greys whatever it was told to be.
   *
   * @example A status the roles have no colour for
   * <Chip
   *   size="sm"
   *   bordered
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
  colors?: ChipColors;
  /**
   * Renders the 32px pill instead of the 36px one (Figma's `small=True`
   * axis on node 986:18006). Only the vertical padding changes — type,
   * radius, gap, and glyph size are shared. No effect at `size="sm"`.
   *
   * @default false
   */
  dense?: boolean;
  /**
   * Persistent selected state (Figma `state=selected`), for filter and
   * multi-select chips. Draws the role's border and its selected fill;
   * hover and press still read over it. No effect at `size="sm"`, which
   * Figma draws as a single flat swatch.
   */
  selected?: boolean;
}
