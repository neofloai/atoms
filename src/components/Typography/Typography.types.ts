import type * as React from 'react';
import type { OverrideProps } from '@mui/material/OverridableComponent';
import type { TypographyOwnProps as MuiTypographyOwnProps } from '@mui/material/Typography';

import type { fontWeights } from '@/src/tokens';

/**
 * The type rungs this system actually defines.
 *
 * Narrower than MUI's on purpose, and the narrowing is the point of the
 * component. `src/theme/typography.ts` maps `h1`-`h6`, `body1`, `body2`
 * and `caption` onto the type scale; MUI's remaining four —
 * `subtitle1`, `subtitle2`, `button`, `overline` — are left at
 * Material's own numbers, because the design library does not define
 * them.
 *
 * Offering those from a Neoflo import would hand out Material metrics
 * under a Neoflo name, which is the one thing this component exists to
 * prevent. `variant="subtitle2"` renders at Material's 14px / 1.57 with
 * no token behind either number, and nothing about the result announces
 * that it left the system.
 *
 * A subtitle in this scale is not a separate rung — it is a body rung in
 * its Medium cut. See `TypographyWeight`.
 *
 * `inherit` is kept. It takes the surrounding type rather than setting
 * any of its own, so it is a way of *declining* the scale rather than a
 * value outside it.
 */
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'inherit';

/**
 * Which cut of the rung to set.
 *
 * The type scale ships every rung twice — a Medium and a Regular with
 * identical size and leading, differing only in weight. The theme has to
 * pick one per variant, and it picks Medium for the headings and Regular
 * for body and caption, which leaves the other cut of every rung with no
 * way in. This is that way in.
 *
 * It resolves from `fontWeights`, so the three values it can produce are
 * the three weights DM Sans ships and nothing else. That is what makes
 * it better than the `sx={{ fontWeight: 600 }}` it replaces: a literal
 * there is on the ladder by luck rather than by reference, and 700 —
 * which DM Sans has no cut for — is the one a hand tends to reach for.
 *
 * Leave it off to take the variant's own cut.
 */
export type TypographyWeight = keyof typeof fontWeights;

/**
 * The props this component owns, as opposed to the ones it inherits.
 *
 * `variant` is redeclared rather than inherited so the narrowed union
 * above is the one consumers see; `weight` is new. Everything else on
 * MUI's `Typography` — `color`, `align`, `noWrap`, `gutterBottom`,
 * `variantMapping`, `classes`, `sx`, `children` — passes through
 * untouched.
 *
 * `color` is deliberately left as MUI's. It resolves through the
 * palette, which this system already owns, so `color="text.secondary"`
 * is already a Neoflo value; narrowing it would be a second, unrelated
 * decision.
 */
export interface TypographyOwnProps {
  /** Which rung of the type scale to set. */
  variant?: TypographyVariant;
  /** Which cut of that rung. Omit for the variant's own. */
  weight?: TypographyWeight;
}

/**
 * MUI's type map with the two changes above applied, so the component
 * can be declared as an `OverridableComponent` and keep its swappable
 * root.
 *
 * The root matters more here than on most components: the rung and the
 * element are separate decisions, and the pair that says so —
 * `variant="h5" component="h1"` — is the normal way to write a page
 * title that should not be set at 80px. A plain `forwardRef` wrapper
 * would pin the root at `span` and drop `component` from the type while
 * still honouring it at runtime.
 *
 * `AdditionalProps` defaults to `object` rather than MUI's `{}`, which
 * `@typescript-eslint/no-empty-object-type` rejects. The two are
 * equivalent as an intersection operand.
 */
export interface TypographyTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'span',
> {
  props: AdditionalProps &
    Omit<MuiTypographyOwnProps, 'variant'> &
    TypographyOwnProps;
  defaultComponent: RootComponent;
}

/**
 * Props for the Neoflo `Typography`.
 *
 * @example Typing a wrapper of your own
 * interface PageTitleProps extends TypographyProps<'h1'> {
 *   badge?: React.ReactNode;
 * }
 */
export type TypographyProps<
  RootComponent extends React.ElementType = 'span',
  AdditionalProps = object,
> = OverrideProps<
  TypographyTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};
