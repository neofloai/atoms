'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { NeofloLogo } from '@/src/brand';
import { Avatar } from '@/src/components/Avatar';
import { Button } from '@/src/components/Button';
import { Divider } from '@/src/components/Divider';
import { Drawer } from '@/src/components/Drawer';
import { IconButton } from '@/src/components/IconButton';
import { Menu } from '@/src/components/Menu';
import { MenuItem } from '@/src/components/MenuItem';
import { ToggleButton } from '@/src/components/ToggleButton';
import { Tooltip } from '@/src/components/Tooltip';
import { fontWeights, surface, text } from '@/src/tokens';
import {
  CaretDownIcon,
  CaretUpDownIcon,
  ChartLineIcon,
  ClockCounterClockwiseIcon,
  FileTextIcon,
  FolderUserIcon,
  GearSixIcon,
  QuestionIcon,
  ScrollIcon,
  SignOutIcon,
  SquaresFourIcon,
  SuitcaseSimpleIcon,
  UsersIcon,
} from '@/src/icons';

import type { CSSObject, Theme } from '@mui/material/styles';

/**
 * The Vendor Query sidebar, rebuilt out of Atoms parts.
 *
 * It is here rather than in the component because a drawer supplies the
 * panel and nothing inside it — so this is what "compose the contents"
 * actually looks like at full size, and it is the demo both the Drawer
 * and the Navbar pages show.
 *
 * Geometry and colour are the shell's own, read off its sidebar frame
 * (591:25991) and its dashboard frame (526:24241): a 220px rail folding to
 * 64, a 16px gutter the blocks stretch between, and four blocks — brand and
 * switcher, the main nav, a second nav group, the signed-in user — with the
 * main nav taking the slack so the last two sit on the bottom edge. No
 * rules: the frames separate those blocks with space.
 *
 * Collapsed, the gutter comes off and the rows centre on the rail's axis
 * instead — every row is symmetric, so centring the row centres its glyph,
 * and the brand mark, the switcher, the nav icons and the avatar all land on
 * one line despite being four different widths.
 *
 * Nothing here is a new component. The nav rows are `ToggleButton`, the one
 * house control that stays pressed; the switcher and the user row are
 * `Button`s that open a `Menu`. Inventing a nav-row component for a demo
 * would put a treatment in the docs that no designer has drawn.
 */

/** Rail widths — expanded on the `sm` rung, folded to a row's square. */
const RAIL_COLLAPSED_PX = 64;

/** Gutter the blocks stretch between. Expanded only. */
const RAIL_GUTTER_PX = 16;

/**
 * Nav row geometry from the design: a 28px row around a 20px glyph
 * (`Scale/350`).
 *
 * 28 is not a `ToggleButton` size — the component set draws 36 and 32 —
 * so the box comes down here while the glyph stays the `md` size's own
 * 20px value. That is why these rows are `md` toggles rather than `sm`:
 * `sm` is built around a 16px glyph, and passing it a 20 would inflate
 * the box past its own 32 and leave the row a size that is neither.
 */
const NAV_ROW_PX = 28;
const NAV_GLYPH_PX = 20;

/**
 * Brand mark height, and the lockup's wordmark scales from it.
 *
 * Not the 32 the frames instance the Logo at. That 32 is the *box*: the
 * layer inspector shows ~8.3px of padding on all four sides around
 * artwork measuring 15.3 x 15.5, so the mark a viewer actually sees is
 * about 15.4. Atoms' `NeofloLogo` is cropped tight — its viewBox is the
 * artwork — so `size` is the visible mark, and passing 32 would render it
 * at roughly twice the design's.
 *
 * 16 is that measurement rounded to the house small-glyph size, and it
 * lands within a pixel of the 17.19 the shell itself renders (see
 * `BRAND_LOCKUP_WIDTH` in its sidebar config, which records the same
 * padded-box-versus-tight-crop problem from the other direction).
 *
 * One number for both states, so the mark neither moves nor resizes when
 * the rail folds.
 */
const LOGO_MARK_PX = 16;

/**
 * Nav row colour, read off the sidebar frame rather than taken from
 * `ToggleButton`'s own table.
 *
 * The toggle's neutral selected fill is `surface/layers/card 2` — which is
 * exactly the surface this rail is painted in, so on a rail the selected
 * row would not show at all. That is no fault of the toggle's: its own
 * component set sits it on a `card 1` toolbar, where `card 2` is the first
 * rung that reads.
 *
 * A rail needs the `default` ladder instead, which is what the design
 * binds — `default-hover` under the pointer, `default-pressed` once
 * selected, the label moving from `caption` ink to `body`. Sampled off the
 * frame at #e5e4e1 and #cccac6, the light values of those two rungs.
 *
 * Written the way `paired` writes it: one object per scheme, so both land
 * in a single `applyStyles('dark')` block rather than two that would
 * discard each other.
 */
function navRowStyles(theme: Theme): CSSObject {
  const scheme = (mode: 'light' | 'dark'): CSSObject => ({
    color: text.default.caption[mode],
    '&:hover': { backgroundColor: surface.default.defaultHover[mode] },
    '&.Mui-selected': {
      backgroundColor: surface.default.defaultPressed[mode],
      color: text.default.body[mode],
      '&:hover': { backgroundColor: surface.default.defaultPressed[mode] },
    },
  });

  return { ...scheme('light'), ...theme.applyStyles('dark', scheme('dark')) };
}

/**
 * The rail draws no rules at all.
 *
 * Its four blocks are separated by space, not lines — the dashboard frame
 * (526:24241) has none, and an earlier draft here drew two. Space is what
 * the design uses, so space is what this uses.
 */

/**
 * The two nav groups, in the order and with the glyphs the dashboard frame
 * names them: `SquaresFour`, `ChartLine`, `GearSix`, `FolderUser` in the
 * main group, `Users` and `Question` in the group above the avatar.
 *
 * The second group exists because the frame pins it to the bottom of the
 * nav rather than continuing the first: the things you reach for
 * occasionally sit apart from the things you navigate by.
 */
export interface RailItem {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}

export const MAIN_NAV: readonly RailItem[] = [
  { key: 'dashboard', label: 'Dashboard', Icon: SquaresFourIcon },
  { key: 'analytics', label: 'Analytics', Icon: ChartLineIcon },
  { key: 'configuration', label: 'Configuration', Icon: GearSixIcon },
  { key: 'vendors', label: 'Vendor details', Icon: FolderUserIcon },
];

export const MAIN_SECONDARY_NAV: readonly RailItem[] = [
  { key: 'team', label: 'Team', Icon: UsersIcon },
  { key: 'help', label: 'Help', Icon: QuestionIcon },
];

/**
 * The workflow rail's own items, from the workflow frame (879:24324):
 * `Scroll`, `FileText` and `ClockCounterClockwise`, with `Question` alone in
 * the group at the bottom.
 *
 * A different set from the main menu's, and that is the point — inside a
 * workflow the rail moves between *sections of the record*, not between
 * destinations in the app. Showing the dashboard's items here would offer to
 * leave the workflow from a strip whose whole job is navigating within it;
 * leaving is what the hamburger and the main menu are for.
 *
 * The frame also hides the avatar block on this rail, so the workflow strip
 * carries no user footer either.
 */
export const WORKFLOW_NAV: readonly RailItem[] = [
  { key: 'invoice', label: 'Invoice', Icon: ScrollIcon },
  { key: 'documents', label: 'Documents', Icon: FileTextIcon },
  { key: 'history', label: 'History', Icon: ClockCounterClockwiseIcon },
];

export const WORKFLOW_SECONDARY_NAV: readonly RailItem[] = [
  { key: 'help', label: 'Help', Icon: QuestionIcon },
];

const WORKSPACES = ['Non-Trade AP', 'Trade AP', 'Vendor Query'];

const USER = {
  name: 'Ankit Verma',
  email: 'ankit.v@neoflo.ai',
  role: 'AP Agent',
};

/** Initials for the avatar — first and last word. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * The signed-in user's avatar, shared by the rail's footer and the bar's
 * trailing cluster so one shell cannot draw two of them.
 *
 * Colour is the design's own avatar cell (753:27289):
 * `surface/primary/default-pressed` behind `text/default/heading`, at
 * `Sans/B3/Medium`. That pairing is not one of `Avatar`'s six roles —
 * `accent` is a softer primary under primary ink, `primary` a saturated one
 * under white — so it is applied here rather than added to the component,
 * whose own colour axis comes from its own component set. See
 * DESIGNER_QUESTIONS.md #46.
 *
 * Shape is `Avatar`'s default `round`. The sidebar frame draws a rounded
 * square; circular is what was asked for, and it makes the rail's avatar and
 * the bar's the same object.
 */
export function UserAvatar({ children }: { children: React.ReactNode }) {
  return (
    <Avatar
      size="sm"
      sx={(theme) => ({
        fontWeight: fontWeights.medium,
        backgroundColor: surface.primary.defaultPressed.light,
        color: text.default.heading.light,
        ...theme.applyStyles('dark', {
          backgroundColor: surface.primary.defaultPressed.dark,
          color: text.default.heading.dark,
        }),
      })}
    >
      {children}
    </Avatar>
  );
}

UserAvatar.displayName = 'UserAvatar';

/**
 * One nav row. A pill the width of the block expanded, a square the height
 * of the row collapsed — the fill is the only part of a row the eye reads,
 * and a 48x28 one would read as a rectangle beside the icons above it.
 */
function NavRow({
  label,
  Icon,
  selected,
  collapsed,
  onSelect,
}: {
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  selected: boolean;
  collapsed: boolean;
  onSelect: () => void;
}) {
  return (
    <Tooltip title={collapsed ? label : ''} placement="right">
      <ToggleButton
        value={label}
        selected={selected}
        onChange={onSelect}
        appearance="text"
        size="md"
        sx={(theme) => ({
          ...navRowStyles(theme),
          height: NAV_ROW_PX,
          minHeight: NAV_ROW_PX,
          gap: 1,
          width: collapsed ? NAV_ROW_PX : '100%',
          minWidth: 0,
          alignSelf: collapsed ? 'center' : 'stretch',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 0 : 1,
          textTransform: 'none',
          fontWeight: selected ? 500 : 400,
          // The panel is mid-animation for 200ms while this row is still
          // laid out at its old width, and flex resolves the overflow by
          // squeezing whatever will give: the glyph collapses towards zero
          // and a two-word label wraps, which makes the row taller than the
          // rail's 28px until the width lands. Pinning the glyph and
          // refusing the wrap leaves the label to be clipped by the panel's
          // own `overflow-x`, which is what should absorb it.
          whiteSpace: 'nowrap',
          '& svg': { flexShrink: 0 },
        })}
      >
        <Icon size={NAV_GLYPH_PX} />
        {!collapsed && (
          <Box
            component="span"
            sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {label}
          </Box>
        )}
      </ToggleButton>
    </Tooltip>
  );
}

NavRow.displayName = 'NavRow';

/**
 * The rail. `collapsed` resolves to a `size` in pixels rather than a name
 * off the scale: a folded rail is the same panel narrowed, so it is the
 * same prop with a different number, and the width animates on its own.
 */
export function AppRail({
  collapsed = false,
  showBrand = true,
  overlay = false,
  open = false,
  onClose,
  onNavigate,
  active: activeProp,
  onActiveChange,
  nav = MAIN_NAV,
  secondaryNav = MAIN_SECONDARY_NAV,
  defaultActive,
  showUser = true,
  container,
}: {
  collapsed?: boolean;
  /**
   * Float over the page instead of reserving space beside it — a
   * `temporary` drawer rather than a `permanent` one.
   *
   * The page header uses this: that bar spans the whole screen, so the
   * navigation under it is something you summon and dismiss rather than
   * a column the layout is built around. It brings the backdrop, the
   * `Escape` handler and the scroll lock with it, and the content behind
   * it does not reflow when it arrives.
   *
   * @default false
   */
  overlay?: boolean;
  /** Whether the overlay is showing. Ignored unless `overlay`. */
  open?: boolean;
  onClose?: () => void;
  /**
   * Fired when a nav row is picked. An overlay should close on navigation
   * — it covers what you just chose to look at — where a docked rail
   * stays put, so this is passed only by the overlay case.
   */
  onNavigate?: () => void;
  /**
   * The selected row, lifted out so two rails can share it.
   *
   * The page header's shell renders this twice — a docked strip that is
   * always there and an overlay that expands over it — and they have to
   * agree about which page you are on. Left uncontrolled (the app bar's
   * shell, which has one rail) it keeps its own.
   */
  active?: string;
  onActiveChange?: (key: string) => void;
  /**
   * Which items the rail carries. The main menu's by default; a workflow
   * strip passes `WORKFLOW_NAV`, whose rows are sections of the record
   * rather than destinations in the app.
   */
  nav?: readonly RailItem[];
  secondaryNav?: readonly RailItem[];
  /** Which row starts selected. Defaults to the first. */
  defaultActive?: string;
  /**
   * The user footer. The workflow frame hides it — a strip for moving
   * around one record has no reason to carry the account menu, which is
   * reachable from the main menu the hamburger brings back.
   *
   * @default true
   */
  showUser?: boolean;
  /**
   * Where the overlay renders. A `temporary` drawer is a `Modal`, which
   * portals to `document.body` and pins itself to the viewport — correct
   * in an app, wrong inside a docs preview, where it would cover the
   * whole page. Passing the preview's own box keeps it in the frame.
   */
  container?: HTMLElement | null;
  /**
   * The brand block — the logo and the workspace switcher.
   *
   * Dropped when the rail hangs under a page header, which is how the
   * frame draws it: that bar already owns the top of the screen, so a
   * second identity directly beneath a record's title has nothing to say,
   * and a workspace control there reads as belonging to the record. What
   * is left is what the rail is actually for — the menu items.
   *
   * One flag rather than two, because neither frame keeps one without the
   * other.
   *
   * @default true
   */
  showBrand?: boolean;
}) {
  const [uncontrolledActive, setUncontrolledActive] = React.useState(
    defaultActive ?? nav[0]?.key ?? ''
  );
  const active = activeProp ?? uncontrolledActive;
  const setActive = onActiveChange ?? setUncontrolledActive;
  const [workspace, setWorkspace] = React.useState(WORKSPACES[0]);
  const [switcherAnchor, setSwitcherAnchor] =
    React.useState<HTMLElement | null>(null);
  const [userAnchor, setUserAnchor] = React.useState<HTMLElement | null>(null);

  /** Expanded, the blocks stretch between the gutters; collapsed they centre. */
  const block = {
    px: collapsed ? 0 : `${RAIL_GUTTER_PX}px`,
    alignItems: collapsed ? 'center' : 'stretch',
  } as const;

  return (
    <Drawer
      variant={overlay ? 'temporary' : 'permanent'}
      open={overlay ? open : undefined}
      onClose={overlay ? onClose : undefined}
      // MUI's Slide, kept. The overlay is not the strip beneath it widening —
      // it is the main menu arriving from off-screen over a workflow that
      // stays where it is, so it should read as coming from outside.
      // The folded width is state, not a fourth rung on the scale — and it
      // goes on `size` rather than on the paper, because it has to reach
      // the space the rail reserves as well as the panel itself.
      size={collapsed ? RAIL_COLLAPSED_PX : 'sm'}
      slotProps={{
        // `absolute` rather than `relative` for the overlay, so the panel
        // pins to the preview box the modal is rendered into; a docked
        // panel is put back in normal flow instead. Neither is MUI's
        // default `fixed`, which belongs to the viewport.
        paper: {
          sx: { position: overlay ? 'absolute' : 'relative', py: 2.5 },
        },
        // The backdrop needs the same treatment as the root, and separately:
        // MUI's is `position: fixed` in its own right, so containing the
        // modal alone still leaves the scrim covering the whole viewport —
        // the docs page around the preview, and the bar above it.
        ...(overlay && container
          ? {
              root: { container, sx: { position: 'absolute' } },
              backdrop: { sx: { position: 'absolute' } },
            }
          : {}),
      }}
    >
      {showBrand && (
      <Stack sx={{ ...block, gap: 2, pb: 2, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignSelf: collapsed ? 'center' : 'flex-start',
            color: 'text.primary',
          }}
        >
          <NeofloLogo
            variant={collapsed ? 'mark' : 'full'}
            size={LOGO_MARK_PX}
          />
        </Box>

        {collapsed ? (
          <Tooltip title={workspace ?? ''} placement="right">
            <IconButton
              variant="secondary"
              appearance="outline"
              size="sm"
              aria-label={workspace}
              onClick={(event) => setSwitcherAnchor(event.currentTarget)}
            >
              <SuitcaseSimpleIcon size={16} />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            fullWidth
            startIcon={<SuitcaseSimpleIcon size={16} />}
            endIcon={<CaretUpDownIcon size={14} />}
            onClick={(event) => setSwitcherAnchor(event.currentTarget)}
            sx={{
              justifyContent: 'space-between',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              // Same reason as the nav rows: the two carets and the suitcase
              // must not be squeezed while the panel is narrowing.
              '& svg': { flexShrink: 0 },
            }}
          >
            <Box
              component="span"
              sx={{
                flex: 1,
                textAlign: 'left',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {workspace}
            </Box>
          </Button>
        )}
      </Stack>
      )}

      {/* The main group takes the slack, which is what pins the two blocks
          below it to the bottom of the rail. With no brand block above it
          the paper's own inset is already the top gap, so the extra 16
          would double it. */}
      <Stack
        sx={{
          ...block,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          gap: 1,
          pt: showBrand ? 2 : 0,
        }}
      >
        {nav.map(({ key, label, Icon }) => (
          <NavRow
            key={key}
            label={label}
            Icon={Icon}
            collapsed={collapsed}
            selected={active === key}
            onSelect={() => {
              setActive(key);
              onNavigate?.();
            }}
          />
        ))}
      </Stack>

      <Stack sx={{ ...block, gap: 1, pb: 2, flexShrink: 0 }}>
        {secondaryNav.map(({ key, label, Icon }) => (
          <NavRow
            key={key}
            label={label}
            Icon={Icon}
            collapsed={collapsed}
            selected={active === key}
            onSelect={() => {
              setActive(key);
              onNavigate?.();
            }}
          />
        ))}
      </Stack>

      {showUser && (
      <Stack sx={{ ...block, flexShrink: 0 }}>
        {collapsed ? (
          <Tooltip title={USER.name} placement="right">
            <IconButton
              variant="secondary"
              appearance="text"
              size="sm"
              aria-label={USER.name}
              onClick={(event) => setUserAnchor(event.currentTarget)}
              // The expanded footer is 36 tall because it holds two lines;
              // matching it here keeps every row above the footer on the same
              // y in both states, which is what lets the overlay read as this
              // strip widening rather than as a different panel.
              sx={{ height: 36 }}
            >
              <UserAvatar>{initials(USER.name)}</UserAvatar>
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            variant="secondary"
            appearance="text"
            fullWidth
            endIcon={<CaretDownIcon size={16} />}
            onClick={(event) => setUserAnchor(event.currentTarget)}
            sx={{
              justifyContent: 'space-between',
              textTransform: 'none',
              // The design pins this row at 36 so dropping the two lines on
              // collapse cannot pull the avatar up. `md` is that height, but
              // its block padding would then stack on top of a 36px pair of
              // lines, so the padding comes off instead of the height.
              py: 0,
              minHeight: 36,
              // The avatar and the caret hold their size while the panel
              // narrows; the name and address are already `noWrap`, so the
              // text block is what gives.
              '& svg': { flexShrink: 0 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                flex: 1,
                '& .MuiAvatar-root': { flexShrink: 0 },
              }}
            >
              <UserAvatar>{initials(USER.name)}</UserAvatar>
              <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {USER.name}
                </Typography>
                <Typography
                  variant="caption"
                  component="p"
                  noWrap
                  color="text.secondary"
                >
                  {USER.email}
                </Typography>
              </Box>
            </Box>
          </Button>
        )}
      </Stack>
      )}

      <Menu
        anchorEl={switcherAnchor}
        open={Boolean(switcherAnchor)}
        onClose={() => setSwitcherAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {WORKSPACES.map((name) => (
          <MenuItem
            key={name}
            selected={name === workspace}
            onClick={() => {
              setWorkspace(name);
              setSwitcherAnchor(null);
            }}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={() => setUserAnchor(null)}
        // Opens upwards off the footer, left edges aligned.
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ px: 2, pt: 0.5, pb: 1 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
            {USER.name}
          </Typography>
          <Typography
            variant="caption"
            component="p"
            noWrap
            color="text.secondary"
          >
            {USER.role}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => setUserAnchor(null)}>
          <GearSixIcon size={16} />
          <Box component="span" sx={{ ml: 1 }}>
            Account settings
          </Box>
        </MenuItem>
        <MenuItem onClick={() => setUserAnchor(null)}>
          <SignOutIcon size={16} />
          <Box component="span" sx={{ ml: 1 }}>
            Log out
          </Box>
        </MenuItem>
      </Menu>
    </Drawer>
  );
}

AppRail.displayName = 'AppRail';
