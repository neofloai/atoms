'use client';

import * as React from 'react';
import { Link as MuiLink, linkClasses } from '@mui/material';

import { radius, text } from '@/src/tokens';

import { FOCUS_RING_WIDTH_PX, paired } from '../_shared/actionStyles';

import type { LinkProps as MuiLinkProps } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type { LinkColor, LinkProps, LinkTypeMap } from './Link.types';

/**
 * Text that navigates. Wraps MUI `Link`, which is an `<a>` with the
 * theme's type and colour on it, and keeps every one of its props.
 *
 * Use it for going somewhere; use `Button` for doing something. That
 * line is worth holding: a link gets the browser's whole navigation
 * affordance for free — a status-bar URL, middle-click, open-in-new-tab,
 * copy-link, back — and a `<button>` that pushes history has none of it.
 *
 * ## No Figma source
 *
 * Like `Divider`, `Skeleton`, `Badge`, and `Progress`, this one has no
 * design to sync against. Searching the Product Design System for a
 * link, an anchor, or a hyperlink returns the Phosphor *icon* of a chain
 * (`Link`, `LinkSimple`, `LinkBreak`, and their horizontal variants —
 * the same set, with the same keyword list, that the Icon Library
 * carries) and no text-link component, no link text style, and no link
 * colour variable. So every value below was derived from tokens the
 * designer did author, and every one is open to being redlined. See
 * DESIGNER_QUESTIONS.md #39.
 *
 * Three decisions came out of that, and each reuses something the system
 * already does rather than inventing a link treatment:
 *
 *   - **The ink is the role's `text.<role>.body` rung, dimming one rung
 *     to `caption` on hover.** That is exactly what an `outline` Button
 *     does with its label (`_shared/actionStyles.ts`), so a `primary`
 *     link and a `primary` outline Button are the same blue at rest and
 *     move together. Press is not a third rung: the ladders only run one
 *     way, and the rungs past `caption` go too pale against one scheme or
 *     the other — measured, not assumed. On an underlined link the colour
 *     is the quieter half of the hover signal, since the underline below
 *     carries most of it; the shift is kept anyway because it is the
 *     *whole* signal for an `underline="none"` link.
 *   - **The underline is 40% of the ink at rest and full strength on
 *     hover**, which is MUI's behaviour and the component's clearest
 *     affordance — the line firms up under the pointer. What changes is
 *     what it is 40% *of*: MUI mixes `palette.<color>.main`, a different
 *     rung from the ink this wrapper paints (a `primary` link is
 *     `primary/700` while `palette.primary.main` is `primary/500`), so
 *     its line is a bluer, lighter hue than the text above it and
 *     ignores an `sx` colour override. Mixing `currentColor` instead
 *     keeps the line the link's own colour in both schemes. Thickness is
 *     `from-font`, matching the one underline the design system does draw
 *     — a `text` Button on hover.
 *   - **Focus-visible is a 3px `currentColor` outline at 2px offset**,
 *     not the house `box-shadow` ring. A `box-shadow` cannot be offset,
 *     so on text with no padding it would paint over the glyphs and the
 *     underline; `outline` is also what MUI itself reaches for on this
 *     component.
 *
 * ## Why the styling goes through `sx` and not `styled()`
 *
 * Every other wrapper in this library is a `styled()` call. This one is
 * not, and the reason is mechanical rather than stylistic.
 *
 * MUI's `Link` is a plain `forwardRef` around an internal
 * `styled(Typography)` root, not a styled component itself. So
 * `styled(MuiLink)` cannot compose — emotion emits a *second* class of
 * equal specificity (0,1,0), and which one wins comes down to which was
 * inserted first. The wrapper renders before the root it wraps, so its
 * class lands first and MUI's palette colour wins, except on a page
 * where some other MUI `Link` rendered earlier and warmed the cache, in
 * which case ours wins. That is a real difference between the docs site
 * and a consumer's app, and between a page's first render and a later
 * one. `&&` would settle it by specificity, at the cost of also
 * out-ranking the caller's own `sx` — which is the documented escape
 * hatch here, so that cure is worse.
 *
 * `sx` has neither problem. MUI appends the `sx` style function *last*
 * within the root's own class, after the theme's `styleOverrides` and
 * after the `variants` that carry the palette colour and the underline
 * rules; and `Link` passes its `sx` straight through to that root. So
 * these styles land inside MUI's class, beating what MUI declares, while
 * the caller's entries — spread after ours in the array — beat these.
 * The cascade is exact in both directions and does not depend on render
 * order.
 *
 * @example An inline link
 * <Link href="/pricing">See the plans</Link>
 *
 * @example Client-side navigation, with the router in charge of `href`
 * import NextLink from 'next/link';
 *
 * <Link component={NextLink} href="/settings/team">Team settings</Link>
 *
 * @example A new tab, with the destination said in the text
 * <Link href="https://status.neoflo.ai" target="_blank" rel="noreferrer">
 *   Status page (opens in a new tab)
 * </Link>
 *
 * @example No meaningful href, so it is a button that looks like a link
 * <Link component="button" type="button" onClick={resend}>
 *   Resend the code
 * </Link>
 *
 * @see Related: Button, Alert, MenuItem, Divider
 */

/**
 * The two rungs a link uses, per colour role.
 *
 * `rest` is the role's `body` slot — the darkest rung in light mode and
 * the lightest in dark — and `hover` is the `caption` slot one step in.
 * The neutral role walks the same ladder as the five accent roles, so a
 * `secondary` link dims on hover rather than darkening; there is no rung
 * darker than `body` outside the `default` group, and having one role
 * move the other way would make the rule two sentences instead of one.
 *
 * `warning` is the one role whose hover rung is not comfortable:
 * `yellow/700` on the page is a pale rung against a light surface. It is
 * offered because MUI, `Chip`, `Badge`, and `Progress` all offer it, and
 * tracked in DESIGNER_QUESTIONS.md #39 rather than silently dropped.
 */
interface RoleTokens {
  readonly rest: ModeToken;
  readonly hover: ModeToken;
}

const roleTokens: Record<Exclude<LinkColor, 'inherit'>, RoleTokens> = {
  primary: { rest: text.primary.body, hover: text.primary.caption },
  secondary: { rest: text.default.body, hover: text.default.caption },
  success: { rest: text.success.body, hover: text.success.caption },
  error: { rest: text.error.body, hover: text.error.caption },
  warning: { rest: text.warning.body, hover: text.warning.caption },
  information: {
    rest: text.information.body,
    hover: text.information.caption,
  },
};

/**
 * Neoflo colour role -> MUI palette role. Only `information` is renamed;
 * the rest already share MUI's word.
 *
 * The mapped value is forwarded rather than dropped for two reasons.
 * MUI keys its underline machinery off it, and every value here is one
 * of the nine names MUI recognises — pass it anything else and it
 * quietly injects an `sx` entry of its own (`{ color: <whatever you
 * passed> }`), which would land *before* these styles and paint an
 * invalid colour.
 */
const muiColorMap: Record<LinkColor, NonNullable<MuiLinkProps['color']>> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  error: 'error',
  warning: 'warning',
  information: 'info',
  inherit: 'inherit',
};

/**
 * Clearance between the text and its focus outline. A named literal
 * because there is no 2 on the spacing ladder (0, 4, 8, 12, 24, 48, 64,
 * 96) — the same gap `Card` and `Accordion` document at 16. 4px would
 * put the ring into the line above in a paragraph; 0 would put it on the
 * glyphs.
 */
const FOCUS_RING_OFFSET_PX = 2;

/**
 * The resting underline, mixed down from the link's own ink.
 *
 * MUI draws its `always` underline at 40% and takes it to full strength
 * on hover, so the line visibly firms up under the pointer. That is the
 * clearest hover affordance the component has and it is kept — but keyed
 * to `currentColor` rather than to `palette.<color>.main`, so the line is
 * a lighter version of *this* link's ink in both colour schemes, and it
 * follows an `sx` colour override instead of ignoring it.
 *
 * 40% is Material's number, carried over rather than chosen: the design
 * system has no underline to copy. `color-mix` is what does the mixing —
 * `alpha()` cannot take `currentColor`, and hard-coding a mixed hex per
 * role and scheme would be twelve invented values instead of one rule.
 */
const UNDERLINE_REST_OPACITY_PCT = 40;
const RESTING_UNDERLINE = `color-mix(in srgb, currentColor ${UNDERLINE_REST_OPACITY_PCT}%, transparent)`;

/**
 * Custom property holding the ink, so `color` stays a single flat
 * declaration.
 *
 * `paired` writes its dark half as a nested `:where([data-mui-color-
 * scheme="dark"]) &` rule, and emotion emits nested rules *after* the
 * flat declarations of the same class — so a paired `color` beats a
 * caller's `sx={{ color }}` in dark mode while losing to it in light,
 * which is a confusing way for an escape hatch to behave. Pairing the
 * variable instead and reading it once in a flat `color` declaration
 * makes the caller's override win in both schemes: their `color` lands
 * after this one, and the nested dark rule only redefines a variable that
 * nothing else reads.
 */
const INK_VAR = '--neoflo-link-ink';

/**
 * Ink, underline, and focus ring for one colour role, in both schemes.
 *
 * Written as a function of the theme so `paired` can emit the dark block,
 * and passed to `sx` rather than to `styled()` — see the header comment.
 */
function linkStyles(theme: Theme, color: LinkColor): CSSObject {
  // `inherit` deliberately paints nothing: the point of it is to take
  // the colour of the copy it sits in. The underline and the focus ring
  // are mixed from `currentColor`, so both follow whatever that turns
  // out to be.
  const role = color === 'inherit' ? null : roleTokens[color];

  return {
    ...(role
      ? { ...paired(theme, { [INK_VAR]: role.rest }), color: `var(${INK_VAR})` }
      : null),
    textDecorationColor: RESTING_UNDERLINE,
    // `from-font` takes the thickness and the offset the typeface itself
    // specifies, which keeps the line clear of descenders at 13px.
    textDecorationThickness: 'from-font',
    textUnderlinePosition: 'from-font',
    '&:hover': {
      ...(role ? paired(theme, { [INK_VAR]: role.hover }) : null),
      // The hover signal: the line firms up to the link's own ink.
      //
      // MUI writes this as `textDecorationColor: inherit`, which lands in
      // the same place by a longer route — the parent's computed value is
      // normally the `currentcolor` keyword, and inheriting a keyword
      // re-resolves it against this element. Measured, MUI's hovered line
      // is its own ink, not the paragraph's. It is restated as
      // `currentColor` for two reasons: it says what it means, and it
      // does not quietly pick up an ancestor that set an explicit
      // `text-decoration-color`. It is also load-bearing for
      // `underline="hover"`, where MUI adds the line but no colour rule,
      // so without this the line would appear at 40% and stay there.
      textDecorationColor: 'currentColor',
    },
    [`&.${linkClasses.focusVisible}`]: {
      outline: `${FOCUS_RING_WIDTH_PX}px solid currentColor`,
      outlineOffset: `${FOCUS_RING_OFFSET_PX}px`,
      // A string, not `radius.xs`. In `sx`, `borderRadius` is a system
      // prop and a bare number is a *multiplier* of
      // `theme.shape.borderRadius` — `4` would render 32px.
      borderRadius: `${radius.xs}px`,
    },
  };
}

const LinkBase = React.forwardRef(function Link(
  { color = 'primary', sx, ...rest }: LinkProps,
  ref: React.Ref<HTMLAnchorElement>
) {
  return (
    <MuiLink
      ref={ref}
      color={muiColorMap[color]}
      {...rest}
      // Ours first, the caller's after, so `sx` still wins — the array
      // form of `sx` merges left to right.
      sx={[(t: Theme) => linkStyles(t, color), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
});

LinkBase.displayName = 'Link';

/**
 * Cast to an `OverridableComponent` for the reason `Card` and `Divider`
 * document: `forwardRef` alone pins the root at `a` and drops
 * `component`, so `<Link component={NextLink} />` would render correctly
 * and fail to compile. It matters more here than anywhere else in the
 * library, since handing the root to a router is the common case rather
 * than the exception.
 */
export const Link = LinkBase as OverridableComponent<LinkTypeMap>;
