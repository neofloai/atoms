'use client';

import * as React from 'react';
import { Tabs as MuiTabs, tabClasses, tabsClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { CaretLeftIcon, CaretRightIcon } from '@/src/icons/glyphs';

import { paired } from '../_shared/actionStyles';

import { TabsContext } from './TabsContext';
import {
  INDICATOR_WIDTH_PX,
  RULE_WIDTH_PX,
  TAB_LIST_GAP_PX,
  TAB_PADDING_BLOCK_PX,
  TAB_PADDING_INLINE_PX,
  indicator,
  indicatorDisabled,
  rule,
} from './tabTokens';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { TabsProps } from './Tabs.types';

/**
 * Caret size for the overflow buttons. The bar has no Figma cell for
 * them, so this borrows the 16px glyph `ToggleButton size="sm"` and
 * `Chip size="sm"` both use next to 12-13px type.
 */
const SCROLL_GLYPH_PX = 16;

function barStyles(
  theme: Theme,
  disabled: boolean,
  divider: boolean
): CSSObject {
  return {
    position: 'relative',
    // No floor. MUI puts 48 here; the bar is as tall as its tabs, which
    // are as tall as their padding and their label.
    minHeight: 0,

    /*
     * The rule under the whole bar, as a pseudo-element rather than a
     * `border-bottom`.
     *
     * A border sits outside the root's padding box, which puts it
     * *below* the indicator instead of behind it: the selected tab would
     * show its rule with a grey one stacked under it, reading as one
     * thick line that changes weight at the selection. `::before` is
     * inserted ahead of the scroller in paint order, so the indicator
     * covers it with no z-index needed, and the bar measures what its
     * tabs measure rather than one pixel more.
     *
     * `divider={false}` drops it entirely, for a bar inside a container
     * that draws its own bottom border — two hairlines on one edge read
     * as a single slightly wrong line.
     */
    ...(divider && {
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 'auto 0 0 0',
        height: RULE_WIDTH_PX,
        ...paired(theme, { backgroundColor: rule }),
      },
    }),

    [`& .${tabsClasses.list}`]: { gap: TAB_LIST_GAP_PX },

    /*
     * MUI measures the indicator from the tab's box, so the 16px of
     * padding either side of a label is what sets its width — nothing
     * here has to compute it.
     *
     * `borderRadius: 0` is explicit: the correction asks for square
     * corners flush to the strip's bottom edge, and at 1px a rounded
     * cap would render as a faded end rather than a curve.
     */
    [`& .${tabsClasses.indicator}`]: {
      height: INDICATOR_WIDTH_PX,
      borderRadius: 0,
      ...paired(theme, {
        backgroundColor: disabled ? indicatorDisabled : indicator,
      }),
    },

    [`& .${tabsClasses.scrollButtons} svg`]: {
      width: SCROLL_GLYPH_PX,
      height: SCROLL_GLYPH_PX,
    },

    /*
     * Vertical is not drawn in Figma. Rather than invent a treatment, it
     * keeps every colour and size and rotates the layout: the rule moves
     * to the inline-end edge and the labels left-align, because a column
     * of centred text has no edge to read down. See
     * DESIGNER_QUESTIONS.md #40.
     */
    [`&.${tabsClasses.vertical}`]: {
      minHeight: 0,
      '&::before': {
        inset: '0 0 0 auto',
        width: RULE_WIDTH_PX,
        height: 'auto',
      },
      [`& .${tabsClasses.indicator}`]: {
        // MUI sets `height` inline here and `width` from the stylesheet,
        // the opposite of the horizontal case.
        width: INDICATOR_WIDTH_PX,
      },
      // Reached from the bar rather than set in `Tab.tsx`, because a tab
      // cannot see which way its parent runs. The two paddings swap: the
      // 16 that sets a horizontal tab's width becomes the distance from
      // the rule, and the 8 becomes the space between stacked labels.
      [`& .${tabClasses.root}`]: {
        padding: `${TAB_PADDING_BLOCK_PX}px ${TAB_PADDING_INLINE_PX}px`,
        // A column of centred text has no edge to read down.
        alignItems: 'flex-start',
        textAlign: 'start',
      },
    },
  };
}

interface StyledTabsProps {
  neofloDisabled: boolean;
  neofloDivider: boolean;
}

const StyledTabs = styled(MuiTabs, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloDisabled' && prop !== 'neofloDivider',
})<StyledTabsProps>(({ theme, neofloDisabled, neofloDivider }) =>
  barStyles(theme, neofloDisabled, neofloDivider)
);

/*
 * Phosphor carets for the overflow buttons, in place of MUI's Material
 * chevrons. They take no props: MUI hands a slot component its
 * `ownerState`, and a Phosphor icon spreads anything it does not
 * recognise onto the `<svg>`, so passing it through would put an
 * `ownerState` attribute in the DOM. Size comes from the rule in
 * `barStyles`. MUI rotates the svg 90deg for a vertical bar, so
 * left/right serve as up/down without a second pair.
 */
const StartCaret = () => <CaretLeftIcon />;
StartCaret.displayName = 'TabsStartCaret';

const EndCaret = () => <CaretRightIcon />;
EndCaret.displayName = 'TabsEndCaret';

/**
 * A row of tabs that switches which panel is showing. Wraps MUI `Tabs`
 * with the Neoflo API.
 *
 * The bar is deliberately plain: a hairline along the bottom, labels at
 * 16/20 in one weight, and a 1px dark rule under whichever tab is
 * selected, running the tab's full width rather than the label's. No
 * fills, no pills, and no weight change — selection is carried by that
 * rule and by two rungs of ink, which is what lets the row hold its
 * width as selection moves along it.
 *
 * The pointer is answered separately, by a `surface/layers/card 2` fill
 * on the tab under it. Hover and selection are two different signals
 * and are drawn two different ways on purpose.
 *
 * MUI's selection model is untouched and is the point of the component:
 * `value` plus `onChange(event, value)`, matched against each child's
 * `value`.
 *
 * Two things worth knowing:
 *
 * - **`Tabs` renders the tab list, not the panels.** MUI's material
 *   package has no `TabPanel`, and this design system has no Figma node
 *   for one, so the panels stay yours: render the selected panel next to
 *   the bar and swap it on `onChange`. The docs page shows the wiring.
 * - **`variant` here is MUI's overflow behaviour**, not the house
 *   "colour role" meaning it has on `Button` and `Chip`. Use
 *   `variant="scrollable"` when the tabs can outgrow their container.
 * - **`divider={false}` when the container draws the line.** The bar
 *   owns its bottom edge by default; inside a panel that already has a
 *   `borderBottom`, hand the edge over rather than painting a second
 *   hairline on it.
 *
 * @example
 * <Tabs value={tab} onChange={(_, next) => setTab(next)}>
 *   <Tab label="All" value="all" />
 *   <Tab label="Open" value="open" count={12} />
 *   <Tab label="Paid" value="paid" />
 * </Tabs>
 *
 * @example Inside a panel that draws its own bottom border
 * <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
 *   <Tabs value={tab} onChange={handleChange} divider={false}>
 *     <Tab label="Open" value="open" />
 *     <Tab label="Closed" value="closed" />
 *   </Tabs>
 * </Box>
 *
 * @example Too many to fit
 * <Tabs value={tab} onChange={handleChange} variant="scrollable">
 *   {regions.map((r) => <Tab key={r.id} label={r.name} value={r.id} />)}
 * </Tabs>
 *
 * @see Related: Tab, Divider, Card, ToggleButtonGroup
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ disabled = false, divider = true, slots, ...rest }, ref) => {
    const barDefaults = React.useMemo(() => ({ disabled }), [disabled]);

    return (
      <TabsContext.Provider value={barDefaults}>
        <StyledTabs
          ref={ref}
          neofloDisabled={disabled}
          neofloDivider={divider}
          {...rest}
          // Spread last so a caller replacing one slot keeps the other,
          // rather than dropping both carets by passing `slots` at all.
          slots={{
            startScrollButtonIcon: StartCaret,
            endScrollButtonIcon: EndCaret,
            ...slots,
          }}
        />
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';
