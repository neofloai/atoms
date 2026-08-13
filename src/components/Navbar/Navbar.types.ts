import type * as React from 'react';
import type {
  AppBarProps as MuiAppBarProps,
  ToolbarProps as MuiToolbarProps,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

/**
 * How the bar is positioned. MUI's own union, unchanged — only the
 * default moves (see `Navbar.tsx`).
 */
export type NavbarPosition = NonNullable<MuiAppBarProps['position']>;

/**
 * How tall the bar is, and therefore what kind of bar it is.
 *
 * `sm` is the app bar: one row, 48px, the chrome that spans a screen and
 * holds controls belonging to the whole app. `md` is the page header:
 * 72px, tall enough for a title with a line of context under it plus the
 * actions that apply to the record on screen.
 *
 * Two rungs rather than a `variant`, because the difference really is
 * only the height — the surface, the rule, the gutter and the row are
 * identical, and what fills them is composition either way.
 */
export type NavbarSize = 'sm' | 'md';

/**
 * Props the navbar locks shut.
 *
 * All five would type-check and then render no change, because the bar's
 * surface is one locked treatment:
 *
 *   - `color` and `enableColorOnDark` only set the `--AppBar-*` custom
 *     properties that MUI's own fill reads. This bar is painted from
 *     tokens instead, so nothing consumes them.
 *   - `variant` is `Paper`'s. `outlined` would draw a full border in
 *     `palette.divider`, fighting the single bottom hairline the design
 *     draws — and in dark mode that token is invisible against this
 *     surface anyway.
 *   - `square` toggles a corner radius that MUI's `AppBar` already
 *     hardcodes off.
 *   - `ref` goes with them because this wrapper is a `forwardRef` and
 *     supplies its own.
 *
 * `elevation` is deliberately *not* locked. It is overwritten with a
 * flat `box-shadow`, but `sx` reaches past that, so a bar that needs to
 * lift off a scrolling page can still say `sx={{ boxShadow: 2 }}` — the
 * same seam `Dialog` and `Drawer` leave open.
 */
type LockedBarProp =
  | 'color'
  | 'enableColorOnDark'
  | 'variant'
  | 'square'
  | 'ref';

/**
 * Props for the Neoflo `Navbar` — the bar across the top of an app.
 *
 * MUI's `AppBarProps` minus the five locked props (see `LockedBarProp`),
 * plus the two that belong to the row inside it. `children` are the row's
 * contents, as they are on MUI's `Toolbar`.
 *
 * `position` keeps MUI's full union and everything else `AppBar` accepts
 * still works, `component` included — the root is a `header` by default,
 * which is MUI's choice and the right one.
 */
export interface NavbarProps extends Omit<MuiAppBarProps, LockedBarProp> {
  /**
   * Height of the bar: `sm` for the 48px app bar, `md` for the 72px page
   * header. See `NavbarSize`.
   *
   * @default 'sm'
   */
  size?: NavbarSize;
  /**
   * Drop the 24px inline gutter, for a bar whose first and last children
   * should sit flush with the page edge. MUI's `Toolbar` prop, forwarded.
   *
   * @default false
   */
  disableGutters?: boolean;
  /**
   * Props for the row inside the bar — the seam for giving it a semantic
   * element (`component="nav"`) or an id.
   *
   * `variant` is not forwardable: the bar's height is pinned, so MUI's
   * `regular` / `dense` toolbar heights have nothing to say here.
   */
  slotProps?: {
    toolbar?: Partial<Omit<MuiToolbarProps, 'variant' | 'disableGutters'>>;
  };
}

/**
 * One item in a `NavbarTitle`'s line of context — a glyph and a label.
 *
 * The glyph is optional and the label is not, because an item with no
 * label is a control rather than a fact about the record, and controls
 * belong in the bar's action group instead.
 */
export interface NavbarMetaItem {
  /**
   * A 16px glyph before the label. Pass the icon itself — it inherits the
   * row's muted ink through `currentColor`, so it needs no colour of its
   * own. `NAVBAR_META_ICON_PX` is the size to give it.
   */
  icon?: React.ReactNode;
  /** The fact itself — a reference, a name, a date. */
  label: React.ReactNode;
}

/**
 * Props for the Neoflo `NavbarTitle` — the page title and the line of
 * context under it.
 *
 * A plain `div` underneath, so `sx`, `className` and the usual DOM props
 * all apply. `children` is the title, as it is on `DialogTitle`.
 */
export interface NavbarTitleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Declared explicitly because the root is a `styled('div')`, which
   * accepts `sx` at runtime while a plain `HTMLAttributes` type does not
   * mention it. Usually an inline margin, to set the block clear of a
   * navigation toggle before it.
   */
  sx?: SxProps<Theme>;
  /** The page title. Rendered as an `h1` inside the block. */
  children?: React.ReactNode;
  /**
   * The line under the title — references, names, dates. Rendered as a
   * row with a vertical rule between each pair; omit it for a bar with
   * nothing but a title.
   */
  meta?: readonly NavbarMetaItem[];
}
