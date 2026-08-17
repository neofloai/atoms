'use client';

import * as React from 'react';
import { ButtonBase } from '@mui/material';
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

import { Chip } from '../Chip';
import { focusRing, paired } from '../_shared/actionStyles';

import { FILTER_ROW_HEIGHT_PX, filterLabelType } from './filterTokens';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';

/**
 * Rail row styling.
 *
 * Three states, and only two of them paint a fill: resting is bare, the
 * pointer shades the row, and the active category holds `card 3` — one
 * rung up the neutral ladder from the panel it sits on — for as long as
 * it is active. The hover rule is dropped entirely on the active row
 * rather than being overridden, because a fill that lightens under the
 * pointer reads as "not selected after all".
 *
 * The label moves with it: `caption` grey at rest, `heading` at Medium
 * once active. Weight and colour together, because a weight change alone
 * is easy to miss in a column of seven.
 */
function tabStyles(theme: Theme, isSelected: boolean): CSSObject {
  const resting: Record<string, ModeToken> = {
    color: isSelected ? text.default.heading : text.default.caption,
  };
  if (isSelected) {
    resting.backgroundColor = surface.layers.card3;
  }

  return {
    // Reserved so the literal holds in both schemes; `paired` only
    // writes a fill on the active row.
    backgroundColor: 'transparent',
    fontWeight: isSelected ? fontWeights.medium : fontWeights.regular,
    ...paired(theme, resting),
    ...(isSelected
      ? {}
      : {
          '&:hover': paired(theme, {
            backgroundColor: surface.default.defaultHover,
          }),
        }),
    /*
     * Inset, unlike the house default. Rows stack flush at 32px with no
     * gap between them, so a 3px ring outside the box would paint over
     * the neighbours above and below rather than around this row.
     */
    '&.Mui-focusVisible': focusRing(theme, border.primary.focus, 'inset'),
  };
}

interface StyledFilterTabProps {
  neofloSelected: boolean;
}

const StyledFilterTab = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'neofloSelected',
})<StyledFilterTabProps>(({ theme, neofloSelected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacing.component.xs,
  width: '100%',
  minHeight: FILTER_ROW_HEIGHT_PX,
  paddingInline: spacing.component.xs,
  borderRadius: radius.xs,
  fontFamily: fontFamilies.product.sans,
  fontSize: filterLabelType.size,
  lineHeight: `${filterLabelType.leading}px`,
  letterSpacing: `${filterLabelType.letterSpacing}em`,
  textAlign: 'left',
  // The badge is part of the row's accessible name, not a control of its
  // own, so it must not draw its own pointer.
  '& .MuiChip-root': { cursor: 'inherit' },
  ...tabStyles(theme, neofloSelected),
}));

/** A truncating label, so a long category name cannot push the badge out. */
const FilterTabLabel = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

FilterTabLabel.displayName = 'FilterTabLabel';

/**
 * Props for one row of the category rail. Internal to `Filter` — the
 * rail is built from `groups`, not composed by hand.
 */
export interface FilterTabProps {
  /** Category name. */
  label: string;
  /** Badge count. Nothing is drawn at `0` or when omitted. */
  count?: number;
  /** Whether this is the category the pane is showing. */
  selected: boolean;
  /** Fires when the row is activated by pointer or keyboard. */
  onSelect: () => void;
}

/**
 * One category in the filter rail: a name, and a count of what is
 * selected under it.
 *
 * The badge is a `Chip size="sm"` — the same 20px tag `Tab` uses for its
 * count, so a filter rail and a tab bar cannot drift into drawing the
 * same number two different ways. It turns `primary` on the active row
 * and stays neutral elsewhere.
 *
 * The rail is a tab list: rows are `role="tab"` with `aria-selected`, so
 * assistive tech announces which category the pane belongs to.
 */
export function FilterTab({
  label,
  count,
  selected,
  onSelect,
}: FilterTabProps): React.JSX.Element {
  const hasCount = count !== undefined && count > 0;

  return (
    <StyledFilterTab
      role="tab"
      aria-selected={selected}
      neofloSelected={selected}
      onClick={onSelect}
    >
      <FilterTabLabel>{label}</FilterTabLabel>
      {hasCount && (
        <Chip
          size="sm"
          variant={selected ? 'primary' : 'secondary'}
          // A `<div>` inside the row's `<button>` would be invalid
          // markup; the badge is phrasing content here.
          component="span"
          label={count}
        />
      )}
    </StyledFilterTab>
  );
}

FilterTab.displayName = 'FilterTab';
