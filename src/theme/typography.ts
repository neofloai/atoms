import type { TypographyVariantsOptions } from '@mui/material/styles';
import {
  fontFamilies,
  fontWeights,
  typography as t,
} from '@/src/tokens';

/**
 * MUI typography options built from the typography tokens.
 *
 * Mapping (MUI variant -> Figma slot):
 *   h1, h2, h3, h4 -> typography.headings.h1..h4
 *   h5, h6         -> derived (no Figma slot — proportional fallbacks)
 *   body1, body2   -> typography.body.b1/b2
 *   caption        -> typography.body.caption
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
  fontWeightBold: fontWeights.bold,

  h1: {
    fontSize: t.headings.h1.size,
    lineHeight: `${t.headings.h1.leading}px`,
    fontWeight: fontWeights.bold,
  },
  h2: {
    fontSize: t.headings.h2.size,
    lineHeight: `${t.headings.h2.leading}px`,
    fontWeight: fontWeights.bold,
  },
  h3: {
    fontSize: t.headings.h3.size,
    lineHeight: `${t.headings.h3.leading}px`,
    fontWeight: fontWeights.bold,
  },
  h4: {
    fontSize: t.headings.h4.size,
    lineHeight: `${t.headings.h4.leading}px`,
    fontWeight: fontWeights.bold,
  },
  // No Figma slot — keep proportional to h4 so the scale stays continuous.
  h5: {
    fontSize: Math.round(t.headings.h4.size * 0.85),
    lineHeight: `${Math.round(t.headings.h4.leading * 0.85)}px`,
    fontWeight: fontWeights.medium,
  },
  h6: {
    fontSize: Math.round(t.headings.h4.size * 0.75),
    lineHeight: `${Math.round(t.headings.h4.leading * 0.75)}px`,
    fontWeight: fontWeights.medium,
  },
  body1: {
    fontSize: t.body.b1.size,
    lineHeight: `${t.body.b1.leading}px`,
    fontWeight: fontWeights.regular,
  },
  body2: {
    fontSize: t.body.b2.size,
    lineHeight: `${t.body.b2.leading}px`,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: t.body.caption.size,
    lineHeight: `${t.body.caption.leading}px`,
    fontWeight: fontWeights.regular,
  },
};
