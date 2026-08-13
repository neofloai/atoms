'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { Button } from '@/src/components/Button';
import { IconButton } from '@/src/components/IconButton';
import {
  NAVBAR_META_ICON_PX,
  Navbar,
  NavbarTitle,
} from '@/src/components/Navbar';
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  ListIcon,
  StarFourIcon,
  TicketIcon,
  UserIcon,
} from '@/src/icons';

/** Gap between the trailing actions — `Scale/250`, as the frame draws it. */
const ACTION_GAP = 1.5;

/** Gap between the leading toggle and the title block — the bar's own gutter. */
const TOGGLE_GAP = 3;

/**
 * The `md` bar: a page header naming a record, with the actions that move
 * it forward.
 *
 * Lives here rather than in the Navbar page's folder because both previews
 * that show it need it — the bar on its own, and the bar in the shell beside
 * a rail — and one implementation is what keeps those two agreeing.
 *
 * The three buttons are the reason the actions are not part of
 * `NavbarTitle`. Each is an ordinary `Button` whose role says what it does —
 * `error` outline for the destructive one, contained primary for the one
 * that advances the record — and no header component can know which of
 * those a given page has.
 */
export function PageHeaderBar({
  collapsed,
  onToggle,
}: {
  /** Only passed when the bar sits above a rail it can fold. */
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Navbar size="md">
      {/* The hamburger, in both cases. The frame draws this glyph whether or
          not there is a rail under the bar to fold, so it stays put — a page
          header spans the whole screen, and the control at its leading edge
          reads as "the navigation" rather than as "that panel there". */}
      <IconButton
        variant="secondary"
        appearance="text"
        size="sm"
        aria-label={
          onToggle === undefined
            ? 'Open navigation'
            : collapsed
              ? 'Expand navigation'
              : 'Collapse navigation'
        }
        onClick={onToggle}
      >
        <ListIcon />
      </IconButton>

      <NavbarTitle
        meta={[
          { icon: <TicketIcon size={NAVBAR_META_ICON_PX} />, label: '#345' },
          {
            icon: <UserIcon size={NAVBAR_META_ICON_PX} />,
            label: 'Nike Sales',
          },
          {
            icon: <CalendarBlankIcon size={NAVBAR_META_ICON_PX} />,
            label: '05 Jun 2025',
          },
        ]}
        sx={{ ml: TOGGLE_GAP }}
      >
        Matching
      </NavbarTitle>

      <Box sx={{ flex: 1 }} />

      <Stack direction="row" sx={{ gap: ACTION_GAP, flexShrink: 0 }}>
        <Button
          appearance="outline"
          size="sm"
          startIcon={<StarFourIcon size={NAVBAR_META_ICON_PX} />}
        >
          Ask Neo
        </Button>
        <Button variant="error" appearance="outline" size="sm">
          Reject
        </Button>
        <Button
          size="sm"
          endIcon={<ArrowRightIcon size={NAVBAR_META_ICON_PX} />}
        >
          Validate
        </Button>
      </Stack>
    </Navbar>
  );
}

PageHeaderBar.displayName = 'PageHeaderBar';
