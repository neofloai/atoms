'use client';

import { FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, text, typography } from '@/src/tokens';

import { paired } from './actionStyles';

/**
 * Shared `FormControlLabel` styling for selector controls (Checkbox,
 * Radio). Applies the Sans/B1/Medium label style from the Figma
 * selector set (node 2080:23677) with token colours in both schemes.
 *
 * Internal — not exported from the package.
 */
export const SelectorFormControlLabel = styled(FormControlLabel)(
  ({ theme }) => ({
    marginLeft: 0,
    marginRight: 0,
    '& .MuiFormControlLabel-label': {
      fontFamily: theme.typography.fontFamily,
      fontSize: typography.body.b1.size,
      fontWeight: fontWeights.medium,
      lineHeight: `${typography.body.b1.leading}px`,
      ...paired(theme, { color: text.default.body }),
      '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
    },
  })
);
