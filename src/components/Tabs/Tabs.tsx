'use client';

import * as React from 'react';
import { Tabs as MuiTabs, tabClasses, tabsClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { CaretLeftIcon, CaretRightIcon } from '@/src/icons';

import { paired } from '../_shared/actionStyles';

import { TabsContext } from './TabsContext';
import {
  BAR_HEIGHT_PX,
  RULE_WIDTH_PX,
  TAB_LABEL_GAP_PX,
  TAB_LABEL_SPACING_PX,
  TAB_PADDING_PX,
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

/**
 * The gap actually set on the tab list. Figma spaces adjacent *labels*
 * 24px apart; each tab keeps `TAB_PADDING_PX` of its own on both faces,
 * so the flex gap is what is left over. Getting this wrong is visible —
 * the whole bar's rhythm comes out of it.
 */
const LIST_GAP_PX = TAB_LABEL_SPACING_PX - TAB_PADDING_PX * 2;

function barStyles(theme: Theme, disabled: boolean): CSSObject {
  return {
    position: 'relative',
    minHeight: BAR_HEIGHT_PX,

    /*
     * The rule under the whole bar, as a pseudo-element rather than a
     * `border-bottom`.
     *
     * A border sits outside the root's padding box, which puts it
     * *below* the indicator instead of behind it: the selected tab would
     * show 1px of colour with 1px of grey underneath, where Figma has
     * one 1px line whose selected segment is coloured. `::before` is
     * inserted ahead of the scroller in paint order, so the indicator
     * covers it with no z-index needed, and the bar measures the 32px
     * the design says it does rather than 33.
     */
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 'auto 0 0 0',
      height: RULE_WIDTH_PX,
      ...paired(theme, { backgroundColor: rule }),
    },

    [`& .${tabsClasses.list}`]: { gap: LIST_GAP_PX },

    /*
     * MUI measures the indicator from the tab's box, so the line runs the
     * tab's full width — the label plus its 8px each side — rather than
     * stopping at the text. Figma draws it at the width of an unpadded
     * tab item, which is the same thing measured on a tab that has no
     * padding; end to end is what it looks like once the tab has some.
     */
    [`& .${tabsClasses.indicator}`]: {
      height: RULE_WIDTH_PX,
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
     * to the inline-end edge, the labels still sit 24px apart centre to
     * centre, and they left-align because a column of centred text has
     * no edge to read down.
     *
     * The two paddings swap with it: the 8px that spaces tabs along the
     * bar becomes vertical, and the 12px `Scale/250` becomes horizontal,
     * where it now holds the label off the rule. See
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
        width: RULE_WIDTH_PX,
      },
      // Reached from the bar rather than set in `Tab.tsx`, because a tab
      // cannot see which way its parent runs.
      [`& .${tabClasses.root}`]: {
        minHeight: 0,
        padding: `${TAB_PADDING_PX}px ${TAB_LABEL_GAP_PX}px`,
        // A column of centred text has no edge to read down.
        alignItems: 'flex-start',
        textAlign: 'start',
      },
    },
  };
}

interface StyledTabsProps {
  neofloDisabled: boolean;
}

const StyledTabs = styled(MuiTabs, {
  shouldForwardProp: (prop) => prop !== 'neofloDisabled',
})<StyledTabsProps>(({ theme, neofloDisabled }) =>
  barStyles(theme, neofloDisabled)
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
 * with the Neoflo API from the Product Design System Figma
 * (node 3463:12374).
 *
 * The bar is deliberately plain: a 1px rule along the bottom, labels
 * 24px apart in neutral ink, and one 1px coloured segment of that rule
 * under whichever tab is selected. No fills, no pills, no weight change
 * — selection is carried by the indicator and by two rungs of ink.
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
 *
 * @example
 * <Tabs value={tab} onChange={(_, next) => setTab(next)}>
 *   <Tab label="All" value="all" />
 *   <Tab label="Open" value="open" count={12} />
 *   <Tab label="Paid" value="paid" />
 * </Tabs>
 *
 * @example Too many to fit
 * <Tabs value={tab} onChange={handleChange} variant="scrollable">
 *   {regions.map((r) => <Tab key={r.id} label={r.name} value={r.id} />)}
 * </Tabs>
 *
 * @see Related: Tab, Divider, Card, ToggleButtonGroup
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ disabled = false, slots, ...rest }, ref) => {
    const barDefaults = React.useMemo(() => ({ disabled }), [disabled]);

    return (
      <TabsContext.Provider value={barDefaults}>
        <StyledTabs
          ref={ref}
          neofloDisabled={disabled}
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
