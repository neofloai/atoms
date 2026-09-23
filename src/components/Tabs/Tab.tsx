'use client';

import * as React from 'react';
import { Tab as MuiTab, tabClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontFamilies, fontWeights, radius } from '@/src/tokens';

import { Chip } from '../Chip';
import { FOCUS_RING_WIDTH_PX, paired } from '../_shared/actionStyles';

import { TabsContext } from './TabsContext';
import {
  BAR_HEIGHT_PX,
  TAB_COUNT_GAP_PX,
  TAB_PADDING_BLOCK_PX,
  TAB_PADDING_INLINE_PX,
  ink,
  labelType,
  labelWeight,
} from './tabTokens';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { TabProps } from './Tabs.types';

/**
 * Box and label geometry.
 *
 * The tab is the full height of the bar with its label centred: 8 above
 * the 24px line and 8 below, which is the 40 the sheet draws. Everything
 * that paints on a tab paints on this box, so it has to be the box a
 * highlight belongs on, and here the sheet and MUI already agree.
 */
const geometry: CSSObject = {
  minHeight: BAR_HEIGHT_PX,
  // MUI reserves 90px per tab and caps it at 360. The sheet's is as wide
  // as its label plus 16 either side and no wider (73px for "Open"), and
  // the bar's rhythm comes out of it — a long row wants
  // `variant="scrollable"`, or `wrapped` below.
  minWidth: 0,
  maxWidth: 'none',
  padding: `${TAB_PADDING_BLOCK_PX}px ${TAB_PADDING_INLINE_PX}px`,
  // Rounds the ripple and the focus ring. Invisible otherwise — a tab
  // carries no fill and no border to round.
  borderRadius: radius.xs,
  textTransform: 'none',
  fontFamily: fontFamilies.product.sans,
  // The resting weight; `stateStyles` moves the selected tab to Medium.
  fontWeight: fontWeights[labelWeight.unselected],
  fontSize: labelType.size,
  lineHeight: `${labelType.leading}px`,
  letterSpacing: `${labelType.letterSpacing}em`,
  // One row that scrolls, rather than tabs that wrap and break the 40px
  // box. MUI's `wrapped` opts back in where a long label needs it, and
  // brings back the 360px it needs something to wrap against.
  whiteSpace: 'nowrap',
  [`&.${tabClasses.wrapped}`]: { whiteSpace: 'normal', maxWidth: 360 },
  // A count pill sits in the tab's accessible name, not on top of it, so
  // it must not swallow the pointer or draw its own text cursor.
  '& .MuiChip-root': { cursor: 'inherit' },
};

/**
 * Ink and weight, in both schemes. There is still no fill and no border
 * — what moves is colour, and now the weight with it.
 *
 * Specificity does the arbitration, which is why these are written as
 * four flat rules rather than nested branches — `&.Mui-selected` and
 * `&.Mui-disabled` (0,2,0) both out-rank `&:hover` (0,1,1), and
 * `disabled` comes last so a disabled *selected* tab reads as disabled.
 * Note that a disabled selected tab keeps the Medium weight: `disabled`
 * overrides the colour and says nothing about weight, so the tab still
 * reads as the one that is selected.
 */
function stateStyles(theme: Theme): CSSObject {
  return {
    ...paired(theme, { color: ink.unselected }),
    '&:hover': paired(theme, { color: ink.hover }),
    /*
     * Ring only, and inset.
     *
     * `currentColor` rather than the house ring token: a tab sits
     * directly on the page with nothing behind it, where
     * `border/default/defaultPressed` measures 2.19:1 (DESIGNER_QUESTIONS
     * .md #38) while the tab's own ink clears 3:1 in both schemes.
     * `Link` made the same call for the same reason.
     *
     * Inset rather than the house `outer` placement because a tab spans
     * the bar's full height: an outer ring would have nothing above or
     * below to sit in, and `variant="scrollable"` would clip it. The
     * 8px of vertical and 16px of horizontal padding are what keep a 3px
     * ring clear of the glyphs.
     */
    '&.Mui-focusVisible': {
      boxShadow: `inset 0 0 0 ${FOCUS_RING_WIDTH_PX}px currentColor`,
    },
    [`&.${tabClasses.selected}`]: {
      ...paired(theme, { color: ink.selected }),
      fontWeight: fontWeights[labelWeight.selected],
    },
    [`&.${tabClasses.disabled}`]: paired(theme, { color: ink.disabled }),
  };
}

const StyledTab = styled(MuiTab)(({ theme }) => ({
  ...geometry,
  ...stateStyles(theme),
}));

/**
 * Wraps the label and its count so the two sit `Scale/250` apart —
 * 12, up from the 4 the previous sheet drew — without putting a `gap`
 * on the tab itself, which would double-space MUI's `icon` slot; that
 * one is spaced with margins.
 */
const TabLabel = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: TAB_COUNT_GAP_PX,
});

/**
 * One tab in a `Tabs` bar. Wraps MUI `Tab` with the Neoflo API from the
 * Revamp UI Figma (node 1367:48488).
 *
 * `label` is the text and `value` is what `Tabs` matches its own `value`
 * against. A tab only works inside a `Tabs` — that is where selection,
 * keyboard handling, and the indicator come from.
 *
 * Two things worth knowing:
 *
 * - **`count` renders a `Chip size="sm"`**, which is the component Figma
 *   nests here, so the pill is the same one used everywhere else.
 * - **`disabled` is inherited from the bar and cannot be undone.**
 *   `Tabs disabled` disables every tab; a tab can add its own on top,
 *   but not opt back in.
 *
 * @example
 * <Tab label="Overview" value="overview" />
 *
 * @example With a count
 * <Tab label="Open" value="open" count={12} />
 *
 * @example With a glyph
 * <Tab label="Activity" value="activity" icon={<PulseIcon />} iconPosition="start" />
 *
 * @see Related: Tabs, Chip, Divider
 */
export const Tab = React.forwardRef<HTMLDivElement, TabProps>(
  ({ count, label, disabled, ...rest }, ref) => {
    const bar = React.useContext(TabsContext);
    // OR-ed rather than "own prop wins": a bar that has been switched
    // off cannot be switched back on by one of its tabs.
    const isDisabled = Boolean(disabled) || Boolean(bar.disabled);

    const content =
      count === undefined || count === null ? (
        label
      ) : (
        <TabLabel>
          {label}
          <Chip
            size="sm"
            // Figma moves the pill to the neutral role on a disabled tab
            // rather than dimming it — node 3463:12465 draws
            // `surface.layers.card3` + `text/default/b2`, which is
            // exactly what `variant="secondary"` paints.
            variant={isDisabled ? 'secondary' : 'primary'}
            // A `<div>` inside the tab's `<button>` would be invalid
            // markup; the pill is phrasing content here.
            component="span"
            label={count}
          />
        </TabLabel>
      );

    return (
      <StyledTab ref={ref} disabled={isDisabled} label={content} {...rest} />
    );
  }
);

Tab.displayName = 'Tab';
