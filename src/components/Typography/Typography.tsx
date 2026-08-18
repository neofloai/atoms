'use client';

import { Typography as MuiTypography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights } from '@/src/tokens';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { TypographyTypeMap, TypographyWeight } from './Typography.types';

interface StyledTypographyProps {
  weight?: TypographyWeight;
}

/**
 * Text on the type scale. Wraps MUI `Typography` and narrows it to the
 * rungs this system defines.
 *
 * Every visual value comes from `src/theme/typography.ts`, which is
 * built from the typography tokens — so `variant="h5"` is 20/28 at
 * -0.01em in DM Sans Medium because that is what the scale says, not
 * because a number was chosen here.
 *
 * ## Why this is a wrapper and not a re-export
 *
 * The theme already styles MUI's `Typography` correctly, so importing it
 * from `@mui/material` looks like it works — and for `h1`-`h6`,
 * `body1`, `body2` and `caption` it does. The problem is the four
 * variants the theme does *not* map. `subtitle1`, `subtitle2`, `button`
 * and `overline` fall through to Material's own metrics, and a screen
 * that reaches for `subtitle2` — which is the natural thing to reach for
 * above a group of fields — silently leaves the design system with no
 * error and no visible tell.
 *
 * That is what this narrows away. It is also why `Typography` is a
 * wrapper while `Box` and the motion primitives are re-exports: those
 * have no house values to hold, and this is almost nothing but house
 * values.
 *
 * ## The scale has two cuts per rung, and `weight` is the second
 *
 * Each rung of the type scale ships a Medium and a Regular with the same
 * size and leading. The theme picks one per variant — Medium for
 * headings, Regular for body and caption — so `weight` is how the other
 * one is reached. It resolves from `fontWeights`, which is the whole
 * reason to use it over `sx`: the three values it can set are the three
 * cuts DM Sans actually ships, and `fontWeight: 700` — a weight with no
 * cut behind it, so the browser synthesises one — stops being reachable
 * by accident.
 *
 * A "subtitle" in this system is `<Typography variant="body1"
 * weight="medium">`, which is why no `subtitle` variant is offered.
 *
 * ## The rung and the element are separate
 *
 * MUI maps each variant to a sensible element (`h5` to `<h5>`, `body1`
 * to `<p>`, `caption` to `<span>`) and `component` overrides it. Both
 * halves survive here, because the size a title should be set at and the
 * level it occupies in the document are different questions —
 * `variant="h5" component="h1"` is a page title that is not 80px tall.
 *
 * @example A page title, set at the size the page needs
 * <Typography variant="h5" component="h1">
 *   Sign in
 * </Typography>
 *
 * @example Body copy
 * <Typography variant="body2" color="text.secondary">
 *   Enter your email and password to continue.
 * </Typography>
 *
 * @example The Medium cut of a body rung — what a subtitle is here
 * <Typography variant="body1" weight="medium">
 *   Billing
 * </Typography>
 *
 * @example Truncating to one line
 * <Typography variant="body2" noWrap>
 *   {invoice.reference}
 * </Typography>
 *
 * @see Related: Link for text that navigates, Alert for a message with a
 * severity, Box and Stack for the layout around it.
 */
const StyledTypography = styled(MuiTypography, {
  // The public prop is `weight` rather than an internal `neofloWeight`
  // like `Chip` and `Alert` carry, because there is no wrapper component
  // here to rename it in: keeping the polymorphic root means `styled()`
  // plus a cast, so whatever the style function reads is also what the
  // consumer writes. MUI's `Typography` has no `weight` of its own, so
  // nothing collides.
  //
  // It still has to be filtered. It drives a style and is not an HTML
  // attribute, so forwarding it would put `weight="medium"` on the
  // rendered element.
  shouldForwardProp: (prop) => prop !== 'weight',
})<StyledTypographyProps>(({ weight }) =>
  weight === undefined ? {} : { fontWeight: fontWeights[weight] }
);

StyledTypography.displayName = 'Typography';

/**
 * Cast to MUI's declaration shape rather than left as the styled
 * component's inferred type, for the reason `Divider`, `Skeleton` and
 * `MenuItem` do the same: `styled()` collapses an `OverridableComponent`
 * down to its default-root props and drops `component` altogether.
 * Without this, `<Typography component="h1" />` fails to compile while
 * rendering an `h1` perfectly well at runtime.
 */
export const Typography =
  StyledTypography as OverridableComponent<TypographyTypeMap>;
