'use client';

import * as React from 'react';
import {
  ToggleButtonGroup as MuiToggleButtonGroup,
  toggleButtonGroupClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { radius, spacing } from '@/src/tokens';

import { ToggleButtonGroupContext } from './ToggleButtonGroupContext';
import { muiColorMap, muiSizeMap } from './toggleButtonTokens';

import type { CSSObject } from '@mui/material/styles';
import type {
  ToggleButtonAppearance,
  ToggleButtonGroupProps,
} from './ToggleButton.types';

interface StyledToggleButtonGroupProps {
  neofloAppearance: ToggleButtonAppearance;
}

/**
 * The group draws nothing itself. Its border, its rounded outside
 * corners, and the hairlines between its buttons are all drawn by the
 * buttons: MUI squares the corners that face a neighbour and pulls each
 * button 1px onto the previous one's border, so the row ends up with a
 * single 1px outline and single 1px dividers. That is exactly how node
 * 3763:5333 is drawn, where the frame and its items both carry the same
 * `border/layers/card 1` stroke and Figma overlaps them.
 *
 * Two deliberate departures from the frame:
 *
 * - No `overflow: hidden`, though Figma clips the group. The focus ring
 *   is a `box-shadow` and clipping would cut it off, which matters more
 *   than the ring escaping the rounded corner by 3px. Nothing else
 *   overflows, because the buttons own the corners.
 * - `appearance="text"` spaces the children 4px apart (`Scale/100`) and
 *   gives each one all four corners back. With no borders left to share
 *   there is nothing to collapse, and touching borderless buttons would
 *   read as one wide button. This is the toolbar in node 3763:5099, and
 *   it is what MUI's own "Customized dividers" demo hand-writes.
 */
const StyledToggleButtonGroup = styled(MuiToggleButtonGroup, {
  shouldForwardProp: (prop) => prop !== 'neofloAppearance',
})<StyledToggleButtonGroupProps>(({ neofloAppearance }) => {
  const base: CSSObject = { borderRadius: radius.sm };

  if (neofloAppearance !== 'text') {
    return base;
  }

  return {
    ...base,
    gap: spacing.component.xxs,
    [[
      `& .${toggleButtonGroupClasses.firstButton}`,
      `& .${toggleButtonGroupClasses.middleButton}`,
      `& .${toggleButtonGroupClasses.lastButton}`,
    ].join(', ')]: {
      // Both undo MUI's collapse: the shorthand takes back all four
      // corners it squared, and the margins take back the 1px overlap in
      // either orientation.
      borderRadius: radius.sm,
      marginLeft: 0,
      marginTop: 0,
    },
  };
});

/**
 * A row or column of `ToggleButton`s that share one selection. Wraps MUI
 * `ToggleButtonGroup` with the Neoflo API from the Product Design System
 * Figma (node 3763:5334).
 *
 * MUI's selection model is untouched, and it is the whole point of the
 * component: `value` plus `onChange(event, value)`, with `exclusive`
 * deciding the shape of `value` — one item (or `null`) when exclusive,
 * an array (possibly empty) when not. `color`, `size`, and `appearance`
 * set the default for every child, and a child can still override any of
 * them.
 *
 * The group renders `role="group"` with no name of its own, so give it an
 * `aria-label` describing what the row controls.
 *
 * @example One of several — text alignment
 * <ToggleButtonGroup
 *   exclusive
 *   value={align}
 *   onChange={(_, next) => next && setAlign(next)}
 *   aria-label="Text alignment"
 * >
 *   <ToggleButton value="left" aria-label="Align left"><TextAlignLeftIcon /></ToggleButton>
 *   <ToggleButton value="center" aria-label="Align centre"><TextAlignCenterIcon /></ToggleButton>
 * </ToggleButtonGroup>
 *
 * @example Any number at once
 * <ToggleButtonGroup value={marks} onChange={(_, next) => setMarks(next)} aria-label="Text formatting">
 *   <ToggleButton value="bold" aria-label="Bold"><TextBIcon /></ToggleButton>
 *   <ToggleButton value="italic" aria-label="Italic"><TextItalicIcon /></ToggleButton>
 * </ToggleButtonGroup>
 *
 * @see Related: ToggleButton, Divider, Card
 */
export const ToggleButtonGroup = React.forwardRef<
  HTMLDivElement,
  ToggleButtonGroupProps
>(
  (
    { color = 'secondary', size = 'md', appearance = 'outline', ...rest },
    ref
  ) => {
    const groupDefaults = React.useMemo(
      () => ({ color, size, appearance }),
      [color, size, appearance]
    );

    return (
      <ToggleButtonGroupContext.Provider value={groupDefaults}>
        <StyledToggleButtonGroup
          ref={ref}
          // Forwarded as well as provided, so MUI's own context and its
          // `.MuiToggleButtonGroup-*` hooks stay consistent for anything
          // reading them — including a raw MUI `ToggleButton` dropped in
          // as a child, which knows nothing about the context above.
          color={muiColorMap[color]}
          size={muiSizeMap[size]}
          neofloAppearance={appearance}
          {...rest}
        />
      </ToggleButtonGroupContext.Provider>
    );
  }
);

ToggleButtonGroup.displayName = 'ToggleButtonGroup';
