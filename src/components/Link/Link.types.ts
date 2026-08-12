import type * as React from 'react';
import type { LinkTypeMap as MuiLinkTypeMap } from '@mui/material';
import type { OverrideProps } from '@mui/material/OverridableComponent';

/**
 * Public API for `Link`.
 *
 * MUI's `Link` API with exactly one prop re-typed and nothing else
 * touched. The component wraps a plain `<a>`, and an anchor has no
 * Material vocabulary in it: `href`, `target`, `rel`, and `download` are
 * HTML, `underline` names a CSS declaration, and `component` is how MUI
 * hands the root to a router.
 *
 * `variant` is the one word that could mislead, and it stays MUI's. On
 * `Button` and `Chip` `variant` is the colour role; here it is the
 * *typography* rung, because `Link` is built on `Typography` and inherits
 * its props. That is the same call `Progress` makes, where `variant`
 * means determinate-or-not. Renaming it would break the inheritance MUI
 * documents, and the colour role sits on `color` — the name MUI already
 * uses for it here.
 */

/**
 * Colour role of a link.
 *
 * MUI's union with one rename (`information` for its `info`), the three
 * `text*` paths dropped, and `inherit` kept.
 *
 * The dropped values are `textPrimary` / `textSecondary` /
 * `textDisabled`, which point at `palette.text.*` — MUI's neutral ink
 * ladder rather than this system's. `secondary` covers the case they
 * exist for: a link that reads as body text and is marked only by its
 * underline. A disabled link is not one of the cases, because there is
 * no such thing — see `Link.tsx`.
 *
 * `inherit` is kept verbatim, and it is the one role with no token
 * behind it. It is how a link inside already-coloured copy stays that
 * colour: the message in an `Alert`, a caption in `text.default.caption`,
 * a heading. Dropping it would mean those links either fight their
 * surroundings or need `sx`.
 */
export type LinkColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'information'
  | 'inherit';

/**
 * When the underline is drawn. MUI's union, unchanged, because it names
 * CSS rather than Material.
 *
 * `always` is the default: colour alone is a weak signal, so a link in a
 * run of text needs the line. `hover` and `none` are for places where
 * something else already marks the link — a nav item, a card that is
 * entirely clickable, a footer column.
 */
export type LinkUnderline = 'always' | 'hover' | 'none';

/**
 * MUI's `LinkTypeMap` with `color` re-typed to the Neoflo roles. The
 * polymorphic root is preserved, which matters more here than on most
 * components: `component={NextLink}` is the normal way to use this.
 */
export interface LinkTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'a',
> {
  props: AdditionalProps &
    Omit<MuiLinkTypeMap<object, RootComponent>['props'], 'color'> & {
      /**
       * Colour role.
       *
       * @default 'primary'
       */
      color?: LinkColor;
    };
  defaultComponent: RootComponent;
}

/**
 * Props for `Link`.
 *
 * MUI's props with `color` narrowed. Everything else is MUI's, including
 * the `Typography` props it inherits (`variant`, `align`, `noWrap`,
 * `gutterBottom`) and `TypographyClasses`.
 *
 * @example Typing a wrapper of your own
 * interface DocsLinkProps extends LinkProps {
 *   section: string;
 * }
 *
 * @example Typing a router link, so `href` is checked by the router
 * const to: LinkProps<typeof NextLink> = { href: { pathname: '/tokens' } };
 */
export type LinkProps<
  RootComponent extends React.ElementType = 'a',
  AdditionalProps = object,
> = OverrideProps<LinkTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};
