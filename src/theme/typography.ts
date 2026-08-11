import type { TypographyVariantsOptions } from '@mui/material/styles';
import {
  fontFamilies,
  fontWeights,
  typography as t,
} from '@/src/tokens';

/**
 * MUI typography options built from the typography tokens.
 *
 * Every variant maps to the *component*-scale ramp in
 * `src/tokens/typography.ts`. The page-scale ramp in
 * `src/tokens/responsive.ts` is deliberately not wired into the theme —
 * it resolves per breakpoint, so a consumer picks the breakpoint rather
 * than inheriting one.
 *
 * Mapping (MUI variant -> Figma slot):
 *   h1-h6          -> typography.headings.h1..h6 (all Medium — the
 *                     Figma type scale has no Bold/SemiBold heading cut)
 *   body1, body2   -> typography.body.b1/b2
 *   caption        -> typography.body.caption (Figma's `Sans/B3`)
 *   subtitle1/2,
 *   button,
 *   overline       -> MUI defaults (the Figma file does not yet define these)
 *
 * Lives in `src/theme/` so it can pull from `@/src/tokens` without
 * making `src/tokens/` depend on MUI.
 */
export const neofloTypography: TypographyVariantsOptions = {
  fontFamily: fontFamilies.product.sans,
  fontWeightRegular: fontWeights.regular,
  fontWeightMedium: fontWeights.medium,
  fontWeightBold: fontWeights.semibold,

  h1: {
    fontSize: t.headings.h1.size,
    lineHeight: `${t.headings.h1.leading}px`,
    letterSpacing: `${t.headings.h1.letterSpacing}em`,
    fontWeight: fontWeights.medium,
  },
  h2: {
    fontSize: t.headings.h2.size,
    lineHeight: `${t.headings.h2.leading}px`,
    letterSpacing: `${t.headings.h2.letterSpacing}em`,
    fontWeight: fontWeights.medium,
  },
  h3: {
    fontSize: t.headings.h3.size,
    lineHeight: `${t.headings.h3.leading}px`,
    letterSpacing: `${t.headings.h3.letterSpacing}em`,
    fontWeight: fontWeights.medium,
  },
  h4: {
    fontSize: t.headings.h4.size,
    lineHeight: `${t.headings.h4.leading}px`,
    letterSpacing: `${t.headings.h4.letterSpacing}em`,
    fontWeight: fontWeights.medium,
  },
  h5: {
    fontSize: t.headings.h5.size,
    lineHeight: `${t.headings.h5.leading}px`,
    letterSpacing: `${t.headings.h5.letterSpacing}em`,
    fontWeight: fontWeights.medium,
  },
  h6: {
    fontSize: t.headings.h6.size,
    lineHeight: `${t.headings.h6.leading}px`,
    letterSpacing: `${t.headings.h6.letterSpacing}em`,
    fontWeight: fontWeights.medium,
  },
  body1: {
    fontSize: t.body.b1.size,
    lineHeight: `${t.body.b1.leading}px`,
    letterSpacing: `${t.body.b1.letterSpacing}em`,
    fontWeight: fontWeights.regular,
  },
  body2: {
    fontSize: t.body.b2.size,
    lineHeight: `${t.body.b2.leading}px`,
    letterSpacing: `${t.body.b2.letterSpacing}em`,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: t.body.caption.size,
    lineHeight: `${t.body.caption.leading}px`,
    letterSpacing: `${t.body.caption.letterSpacing}em`,
    fontWeight: fontWeights.regular,
  },
};
