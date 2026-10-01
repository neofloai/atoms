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
  SEGMENTED,
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
    // 4px (`Scale/100`), following `Button` — the two are the same class
    // of control and a toggle sits beside a button often enough that a
    // half-step difference in corner reads as a bug (#57).
    borderRadius: radius.xs,
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

/**
 * The whole of `appearance="segmented"`, geometry and colour together —
 * it shares no size or role with the other two appearances, so it does
 * not go through `sizeStyles` or `stateStyles`.
 *
 * Under `&&` so the selected thumb's hairline is one class more specific
 * than the transparent left (or top) edge MUI's group puts on every
 * button after the first to collapse it against its neighbour. A
 * segmented button has nothing to collapse, and without this the thumb
 * would lose its left edge whenever it is not the first button.
 */
function segmentedStyles(theme: Theme): CSSObject {
  const label = SEGMENTED.label;
  return {
    '&&': {
      // The border is reserved at rest so selecting a button does not
      // move it, and comes out of the padding — Figma strokes inside the
      // 24px box. 3 + 1 + 16 + 1 + 3 = 24.
      paddingBlock: SEGMENTED.paddingBlockPx - OUTLINE_BORDER_WIDTH_PX,
      paddingInline: SEGMENTED.paddingInlinePx - OUTLINE_BORDER_WIDTH_PX,
      border: `${OUTLINE_BORDER_WIDTH_PX}px solid transparent`,
      borderRadius: radius.xs,
      gap: SEGMENTED.gapPx,
      fontFamily: fontFamilies.product.sans,
      fontWeight: fontWeights.regular,
      fontSize: label.size,
      lineHeight: `${label.leading}px`,
      letterSpacing: `${label.letterSpacing}em`,
      // MUI's `button` ramp uppercases; the design's labels keep their
      // case, and a unit like `7d` means something else as `7D`.
      textTransform: 'none',
      whiteSpace: 'nowrap',
      backgroundColor: 'transparent',
      '& > svg': { width: SEGMENTED.glyphPx, height: SEGMENTED.glyphPx },
      ...paired(theme, { color: SEGMENTED.ink }),
      '&:hover': {
        backgroundColor: 'transparent',
        ...paired(theme, { color: SEGMENTED.hoverInk }),
      },
      '&:active': paired(theme, { color: SEGMENTED.pressedInk }),
      '&.Mui-focusVisible': focusRing(theme, SEGMENTED.focusRing),
      [`&.${toggleButtonClasses.selected}`]: {
        fontWeight: fontWeights.medium,
        letterSpacing: `${SEGMENTED.selectedTrackingEm}em`,
        ...paired(theme, {
          backgroundColor: SEGMENTED.thumbBg,
          borderColor: SEGMENTED.thumbBorder,
          color: SEGMENTED.selectedInk,
        }),
        // The thumb is already the strongest state a button can reach,
        // so the pointer leaves it alone.
        '&:hover': paired(theme, {
          backgroundColor: SEGMENTED.thumbBg,
          color: SEGMENTED.selectedInk,
        }),
      },
      [`&.${toggleButtonClasses.disabled}`]: paired(theme, {
        color: text.disabled.default,
      }),
      // A disabled button that is still on keeps its thumb, or it would
      // read as off; only the ink and the hairline go grey.
      [`&.${toggleButtonClasses.disabled}.${toggleButtonClasses.selected}`]:
        paired(theme, {
          borderColor: border.disabled.default,
          color: text.disabled.default,
        }),
    },
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
  ({ theme, neofloColor, neofloSize, neofloAppearance }) =>
    neofloAppearance === 'segmented'
      ? segmentedStyles(theme)
      : {
          ...sizeStyles(neofloSize),
          ...stateStyles(theme, neofloColor, neofloAppearance),
        }
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
 * One thing worth knowing: **selection is carried by the glyph, not only
 * the fill.** The fill under the pointer is the same fill selection uses;
 * the ink is what differs. That is a consequence of where the design put
 * the selected fill — see `toggleButtonTokens.ts`.
 *
 * @example Standalone
 * <ToggleButton value="bold" selected={bold} onChange={() => setBold(!bold)} aria-label="Bold">
 *   <TextBIcon />
 * </ToggleButton>
 *
 * @example Borderless, for a toolbar
 * <ToggleButton value="italic" appearance="text" aria-label="Italic"><TextItalicIcon /></ToggleButton>
 *
 * `appearance="segmented"` is set on the group, which draws the track;
 * see `ToggleButtonGroup`.
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
