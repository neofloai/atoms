'use client';

import * as React from 'react';
import {
  ToggleButton as MuiToggleButton,
  toggleButtonClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
} from '@/src/tokens';

import {
  OUTLINE_BORDER_WIDTH_PX,
  focusRing,
  paired,
  pairedFocusRing,
} from '../_shared/actionStyles';

import { ToggleButtonGroupContext } from './ToggleButtonGroupContext';
import {
  HOVER_BG,
  PRESSED_BG,
  TOGGLE_BORDER_TOKEN,
  TOGGLE_PADDING_PX,
  UNSELECTED_INK,
  glyphSizePx,
  labelType,
  muiColorMap,
  muiSizeMap,
  roleTokens,
} from './toggleButtonTokens';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type {
  ToggleButtonAppearance,
  ToggleButtonColor,
  ToggleButtonProps,
  ToggleButtonSize,
} from './ToggleButton.types';

/**
 * Box and label geometry. The border is reserved at every appearance and
 * subtracted from the padding, so `outline` and `text` measure the same
 * and a grouped toggle keeps its width when MUI turns its left border
 * transparent to collapse it against its neighbour.
 */
function sizeStyles(size: ToggleButtonSize): CSSObject {
  const type = labelType[size];
  const glyph = glyphSizePx[size];
  return {
    padding: TOGGLE_PADDING_PX - OUTLINE_BORDER_WIDTH_PX,
    borderRadius: radius.sm,
    borderWidth: OUTLINE_BORDER_WIDTH_PX,
    borderStyle: 'solid',
    // Only reached by a toggle holding both a glyph and a label, which
    // Figma does not draw. `Chip` spaces its icon from its label the
    // same way.
    gap: spacing.component.xxs,
    fontFamily: fontFamilies.product.sans,
    fontWeight: fontWeights.medium,
    fontSize: type.size,
    lineHeight: `${type.leading}px`,
    letterSpacing: `${type.letterSpacing}em`,
    // Direct children only, so a nested glyph inside a label keeps its
    // own size.
    '& > svg': { width: glyph, height: glyph },
  };
}

/**
 * Resting / hover / pressed / focus-visible / disabled / selected
 * colour, in both schemes.
 *
 * Selection is applied as a nested rule rather than a separate branch
 * because it is a persistent state that hover and press still read over
 * — the same reason `Chip` treats its own `selected` that way.
 */
function stateStyles(
  theme: Theme,
  color: ToggleButtonColor,
  appearance: ToggleButtonAppearance
): CSSObject {
  const role = roleTokens[color];
  const bordered = appearance === 'outline';

  // Mode-aware properties are collected per selector and expanded in one
  // `paired` call each — two of them spread into the same rule would
  // drop the first one's dark block.
  const rest: Record<string, ModeToken> = { color: UNSELECTED_INK };
  const disabled: Record<string, ModeToken> = { color: text.disabled.default };
  if (bordered) {
    rest.borderColor = TOGGLE_BORDER_TOKEN;
    disabled.borderColor = border.disabled.default;
  }

  return {
    backgroundColor: 'transparent',
    // A literal, so `text` stays borderless in *both* schemes rather
    // than only in light. `outline` overwrites it from the token above.
    borderColor: 'transparent',
    ...paired(theme, rest),
    '&:hover': paired(theme, { backgroundColor: HOVER_BG }),
    '&:active': paired(theme, { backgroundColor: PRESSED_BG }),
    // Ring only. Filling on focus would make a focused toggle look
    // selected, which is the one thing this control cannot afford.
    '&.Mui-focusVisible': focusRing(theme, role.focusRing),
    [`&.${toggleButtonClasses.selected}`]: {
      ...paired(theme, {
        backgroundColor: role.selectedBg,
        color: role.selectedInk,
      }),
      '&:hover': paired(theme, { backgroundColor: role.selectedBgHover }),
      '&:active': paired(theme, { backgroundColor: role.selectedBgHover }),
      '&.Mui-focusVisible': pairedFocusRing(
        theme,
        { backgroundColor: role.selectedBgHover },
        role.focusRing
      ),
    },
    [`&.${toggleButtonClasses.disabled}`]: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      ...paired(theme, disabled),
    },
    // A disabled toggle that is still on keeps a fill, or it would read
    // as off. One class more specific than the rule above, so it wins
    // whichever order Emotion emits them in.
    [`&.${toggleButtonClasses.disabled}.${toggleButtonClasses.selected}`]:
      paired(theme, { backgroundColor: surface.disabled.default }),
  };
}

interface StyledToggleButtonProps {
  neofloColor: ToggleButtonColor;
  neofloSize: ToggleButtonSize;
  neofloAppearance: ToggleButtonAppearance;
}

const StyledToggleButton = styled(MuiToggleButton, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloColor' &&
    prop !== 'neofloSize' &&
    prop !== 'neofloAppearance',
})<StyledToggleButtonProps>(
  ({ theme, neofloColor, neofloSize, neofloAppearance }) => ({
    ...sizeStyles(neofloSize),
    ...stateStyles(theme, neofloColor, neofloAppearance),
  })
);

/**
 * A control that stays pressed — bold on a toolbar, a view that is
 * currently showing, a filter that is on. Wraps MUI `ToggleButton` with
 * the Neoflo API from the Product Design System Figma (node 3763:4790).
 *
 * `value` is required and `selected` is what draws it pressed. Inside a
 * `ToggleButtonGroup` the group owns selection and matches it against
 * `value`, so `selected` is not passed by hand there.
 *
 * Two things worth knowing:
 *
 * - **Selection is carried by the glyph, not only the fill.** The fill
 *   under the pointer is the same fill selection uses; the ink is what
 *   differs. That is a consequence of where the design put the selected
 *   fill — see `toggleButtonTokens.ts`.
 * - **An icon-only toggle needs an `aria-label`.** MUI supplies
 *   `aria-pressed` from `selected`, so assistive technology announces
 *   the pressed state, but it has no name of its own to announce.
 *
 * @example Standalone
 * <ToggleButton value="bold" selected={bold} onChange={() => setBold(!bold)} aria-label="Bold">
 *   <TextBIcon />
 * </ToggleButton>
 *
 * @example Borderless, for a toolbar
 * <ToggleButton value="italic" appearance="text" aria-label="Italic"><TextItalicIcon /></ToggleButton>
 *
 * @see Related: ToggleButtonGroup, IconButton, Chip, Checkbox
 */
export const ToggleButton = React.forwardRef<
  HTMLButtonElement,
  ToggleButtonProps
>(({ color, size, appearance, ...rest }, ref) => {
  // `own prop > group > default`, which is MUI's own precedence for the
  // props its group forwards.
  const group = React.useContext(ToggleButtonGroupContext);
  const resolvedColor = color ?? group.color ?? 'secondary';
  const resolvedSize = size ?? group.size ?? 'md';
  const resolvedAppearance = appearance ?? group.appearance ?? 'outline';

  return (
    <StyledToggleButton
      ref={ref}
      color={muiColorMap[resolvedColor]}
      size={muiSizeMap[resolvedSize]}
      neofloColor={resolvedColor}
      neofloSize={resolvedSize}
      neofloAppearance={resolvedAppearance}
      {...rest}
    />
  );
});

ToggleButton.displayName = 'ToggleButton';
