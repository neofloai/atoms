'use client';

import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  elevation,
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import {
  FILTER_BAR_HEIGHT_PX,
  FILTER_BODY_HEIGHT_PX,
  FILTER_GAP_PX,
  FILTER_INSET_PX,
  FILTER_RAIL_WIDTH_PX,
  FILTER_WIDTH_PX,
  filterTitleType,
} from './filterTokens';

import type { CSSObject, Theme } from '@mui/material/styles';

/** The 1px rules that divide the panel into its four regions. */
const RULE_WIDTH_PX = 1;

function rule(theme: Theme, side: 'Bottom' | 'Top' | 'Right'): CSSObject {
  return {
    borderStyle: 'solid',
    borderWidth: 0,
    [`border${side}Width`]: RULE_WIDTH_PX,
    ...paired(theme, { borderColor: border.layers.card2 }),
  };
}

/**
 * A text `Button` insets its label 8px of its own, so a bar padded to
 * the panel's 16px edge would sit its actions at 24. The bars pull back
 * by that much and let the button's padding make up the difference,
 * which is what puts `Clear all filter` on the same edge as the title
 * beside it.
 */
const BAR_ACTION_INSET_PX = FILTER_INSET_PX - spacing.component.xs;

/**
 * The floating panel itself.
 *
 * Same surface as `Menu` — `card 2` behind a `card 2` rule, 16px
 * corners, `Shadow/medium` — because both are panels that float above
 * the page, and a filter opening beside a menu should not look like it
 * came from a different system. `overflow: hidden` is what lets the
 * rail's fills and the bars' rules run to the edge and still be clipped
 * by those corners.
 */
export const FilterPanel = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: FILTER_WIDTH_PX,
  maxWidth: '100%',
  overflow: 'hidden',
  borderRadius: radius.lg,
  borderWidth: RULE_WIDTH_PX,
  borderStyle: 'solid',
  boxShadow: elevation.medium,
  fontFamily: fontFamilies.product.sans,
  // MUI's `Paper` lightens itself in dark mode with a gradient keyed off
  // elevation; the surface token already carries the dark value.
  backgroundImage: 'none',
  ...paired(theme, {
    backgroundColor: surface.layers.card2,
    borderColor: border.layers.card2,
  }),
}));

FilterPanel.displayName = 'FilterPanel';

/** Title bar across the top of the panel. */
export const FilterTopBar = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacing.component.xs,
  minHeight: FILTER_BAR_HEIGHT_PX,
  paddingLeft: FILTER_INSET_PX,
  paddingRight: BAR_ACTION_INSET_PX,
  ...rule(theme, 'Bottom'),
}));

FilterTopBar.displayName = 'FilterTopBar';

export const FilterTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: filterTitleType.size,
  fontWeight: fontWeights.medium,
  lineHeight: `${filterTitleType.leading}px`,
  letterSpacing: `${filterTitleType.letterSpacing}em`,
  ...paired(theme, { color: text.default.heading }),
}));

FilterTitle.displayName = 'FilterTitle';

/** The two columns, at a height that does not move between categories. */
export const FilterBody = styled('div')({
  display: 'flex',
  height: FILTER_BODY_HEIGHT_PX,
  minHeight: 0,
});

FilterBody.displayName = 'FilterBody';

/** Category rail down the left. */
export const FilterRail = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  width: FILTER_RAIL_WIDTH_PX,
  paddingBlock: FILTER_GAP_PX,
  paddingInline: FILTER_INSET_PX,
  overflowY: 'auto',
  ...rule(theme, 'Right'),
}));

FilterRail.displayName = 'FilterRail';

/** Option pane on the right, holding the body and its bulk-action bar. */
export const FilterPane = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
});

FilterPane.displayName = 'FilterPane';

/** `Select all` / `Clear all`, at the foot of the pane only. */
export const FilterBottomBar = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: FILTER_BAR_HEIGHT_PX,
  paddingInline: BAR_ACTION_INSET_PX,
  ...rule(theme, 'Top'),
}));

FilterBottomBar.displayName = 'FilterBottomBar';
