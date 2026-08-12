import type { ChipProps as MuiChipProps } from '@mui/material';
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
export interface ChipProps
  extends Omit<MuiChipProps, 'variant' | 'size' | 'color'> {
  /** Colour role. @default 'primary' */
  variant?: ChipVariant;
  /** Visual emphasis. @default 'contained' */
  appearance?: ChipAppearance;
  /** Pill size. @default 'md' */
  size?: ChipSize;
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
