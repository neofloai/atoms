'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconButton } from '@/src/components/IconButton';
import { Navbar } from '@/src/components/Navbar';
import { SidebarSimpleIcon } from '@/src/icons';

import {
  AppRail,
  WORKFLOW_NAV,
  WORKFLOW_SECONDARY_NAV,
} from './AppRail';
import { PageHeaderBar } from './PageHeaderBar';

import type { NavbarSize } from '@/src/components/Navbar';

/**
 * The Vendor Query shell — the drawer and the navbar in the arrangement the
 * design puts them in, shared by both component pages so neither draws its
 * own sketch of it.
 *
 * ## The rail is full height and the bar is not full width
 *
 * This is the part worth getting right, and the part an earlier draft had
 * backwards. The dashboard frame runs the rail from the top of the viewport
 * to the bottom and starts the bar at the rail's right edge, so the bar
 * spans the content column only. Two consequences follow from it:
 *
 *   - the brand mark is the top-left corner of the app, not something
 *     tucked under a bar, and
 *   - the bar cannot hold anything that has to line up with the rail,
 *     which is why the collapse toggle sits at its leading edge — the one
 *     control whose position does not move when the rail folds.
 *
 * So the outer box is a row (rail, then a column), not a column (bar, then
 * a row). `Navbar` is `position: static`, so it simply sits at the top of
 * that column with no spacer under it.
 *
 * ## The bar holds one control, at `sm`
 *
 * The frame leaves the rest of the row empty on purpose (526:24230 draws
 * the toggle and nothing else), and that space is where per-page actions
 * land. Nothing is invented to fill it here.
 *
 * ## `md` inverts the arrangement, and that is the point
 *
 * `md` is not `sm` at a different height. It is a different screen: picking
 * an item in the main shell *replaces* the whole view with a workflow —
 * the page header spanning the top with the record's title, context and
 * actions, and the rail reduced to a strip beside it. The corner goes to
 * whichever of the two owns the wider scope: the rail at `sm`, because the
 * brand is the app; the bar at `md`, because the title names everything
 * under it.
 *
 * ## The workflow rail stays half closed, and the main menu floats back in
 *
 * Three things follow, and they are the whole behaviour:
 *
 *   - **The strip does not expand.** Inside a workflow the rail is always
 *     the 64px icon strip. It reserves its width, so the record starts
 *     beside it rather than under it, and it never widens in place.
 *   - **The hamburger brings back the main menu**, not that strip widened.
 *     It floats the full rail in from off-screen — brand, switcher, nav,
 *     user — over a workflow that stays exactly where it is. That is the
 *     way back out to everything else, which is why it slides in from
 *     outside rather than growing out of the strip.
 *   - **It overlays rather than pushes.** The record keeps its width and
 *     never reflows, which matters because what is on screen at `md` is one
 *     record rather than a list that could absorb a shift. Picking a
 *     destination closes it.
 *
 * The two rails share `active` so the strip behind the menu cannot be left
 * showing a different page from the one just chosen.
 *
 * The backdrop and the panel are anchored to the region below the bar rather
 * than to the whole frame. A page header stays legible while the menu in
 * front of it comes and goes — dimming the record's title and its actions
 * would leave nothing on screen saying what the menu is even in front of.
 *
 * The hamburger stays put through both sizes: same control, same place, and
 * at `md` it is the only thing in the bar that is not about the record.
 */
export function AppShell({
  height,
  size = 'sm',
}: {
  height: number;
  size?: NavbarSize;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const toggle = () => setCollapsed((previous) => !previous);

  /** `md` only: whether the overlay rail is showing. */
  const [navOpen, setNavOpen] = React.useState(false);
  /**
   * The region the overlay renders into — everything *below* the bar, not
   * the whole frame.
   *
   * A page header stays put while the navigation under it comes and goes:
   * the bar names the record and holds its actions, and covering those with
   * a scrim would leave nothing on screen identifying what the navigation
   * is even in front of. Anchoring the modal here rather than to the frame
   * is what keeps the header clear of both the panel and the backdrop.
   *
   * Held in state via a callback ref rather than a `useRef`, because the
   * value is needed *during* render — it is passed to the modal as its
   * container. A ref read in render is empty on the first pass and never
   * triggers a second, so the modal would portal to `document.body` and its
   * backdrop would cover the whole page, the bar included.
   */
  const [belowBar, setBelowBar] = React.useState<HTMLDivElement | null>(null);

  // The two `md` rails deliberately do *not* share a selection. An earlier
  // draft lifted it here on the assumption they showed the same items; they
  // do not — the strip moves between sections of the record and the menu
  // between destinations in the app — so each owns its own.

  const frame = {
    height,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 1.5,
    border: '1px solid',
    borderColor: 'divider',
  } as const;

  const content = (
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto', p: 3 }}>
      <Stack sx={{ gap: 2, maxWidth: 560 }}>
        {size === 'sm' && (
          <>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Vendor Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Authorised contacts and uploaded documents, per vendor.
            </Typography>
          </>
        )}
        <Typography variant="body2" color="text.secondary">
          {size === 'md'
            ? 'Inside a workflow. The header names the record and carries its actions, and the rail is a strip of icons that stays half closed — it never widens in place. Press the hamburger and the main menu floats in from outside, over this column rather than pushing it, so the record never reflows; pick a destination, or press Escape, and it goes again.'
            : 'The main shell. The rail runs the full height of the app and the bar starts where it ends, so the brand mark is the top-left corner of the screen. Fold the rail with the toggle: its width animates, the labels drop out, and this column widens to take the space back. Picking an item here replaces the whole screen with a workflow.'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Both surfaces are the same <code>card 2</code> fill behind the same{' '}
          <code>card 2</code> edge, so the two meet at the corner with no seam,
          and the page reads as sitting inside the app rather than beside it.
        </Typography>
      </Stack>
    </Box>
  );

  // A page header owns the top edge; an app bar gives it to the rail.
  if (size === 'md') {
    return (
      <Stack sx={frame}>
        {/* Toggles rather than only opening. The backdrop stops at the bar,
            so the hamburger stays clickable while the overlay is up, and a
            control that opened but would not close would be a dead end. */}
        <PageHeaderBar
          collapsed={!navOpen}
          onToggle={() => setNavOpen((previous) => !previous)}
        />

        {/* `position: relative` is what the overlay's `absolute` anchors to,
            so the panel and its backdrop stop at the bar rather than running
            up over it. */}
        <Box
          ref={setBelowBar}
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* The workflow rail: always half closed, and it does not expand.
              A strip of icons that reserves its 64px so the record starts
              beside it rather than under it.

              Its own items, not the dashboard's — sections of the record
              rather than destinations in the app. No brand block and no user
              footer either: the header above owns the top of the screen, and
              the account menu belongs to the main menu. */}
          <AppRail
            collapsed
            showBrand={false}
            showUser={false}
            nav={WORKFLOW_NAV}
            secondaryNav={WORKFLOW_SECONDARY_NAV}
          />

          {content}

          {/* The main menu, floated back in. This is not the strip widening:
              it is the full rail — brand, switcher, nav, user — arriving from
              off-screen over a workflow that stays exactly where it is. That
              is what the hamburger is for, and it is the way back out of a
              workflow to everything else. It overlays rather than pushes, so
              the record never reflows, and it closes as soon as a
              destination is picked. */}
          <AppRail
            overlay
            open={navOpen}
            onClose={() => setNavOpen(false)}
            onNavigate={() => setNavOpen(false)}
            defaultActive="vendors"
            container={belowBar}
          />
        </Box>
      </Stack>
    );
  }

  return (
    <Stack direction="row" sx={frame}>
      <AppRail collapsed={collapsed} />
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Navbar>
          <IconButton
            variant="secondary"
            appearance="text"
            size="sm"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggle}
          >
            <SidebarSimpleIcon />
          </IconButton>
        </Navbar>
        {content}
      </Stack>
    </Stack>
  );
}

AppShell.displayName = 'AppShell';
