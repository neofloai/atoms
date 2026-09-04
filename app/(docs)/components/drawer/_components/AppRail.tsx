'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { NeofloLogo } from '@/src/brand';
import { Avatar } from '@/src/components/Avatar';
import { Button } from '@/src/components/Button';
import { Collapse } from '@/src/components/Collapse';
import { Divider } from '@/src/components/Divider';
import { Drawer } from '@/src/components/Drawer';
import { IconButton } from '@/src/components/IconButton';
import { Menu } from '@/src/components/Menu';
import { MenuItem } from '@/src/components/MenuItem';
import { ToggleButton } from '@/src/components/ToggleButton';
import { Tooltip } from '@/src/components/Tooltip';
import {
  border,
  elevation,
  fontWeights,
  radius,
  surface,
  text,
} from '@/src/tokens';
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
 *
 * ## The second level
 *
 * A row with `children` is a group rather than a destination: it opens and
 * closes instead of navigating, and it never takes the selected fill. The
 * branched sidenav frame (1262:78156) puts that level in two places, and
 * both are built here — expanded, the children reflow in behind a branch
 * rule at a 32px indent; folded, they arrive in a flyout anchored to the
 * parent's glyph and headed with the parent's name, because at 64px there
 * is no width to indent into and no label left to indent under.
 *
 * That frame also draws a third row state the rail did not have. The fill
 * marks the one page you are on; a parent whose child is that page takes
 * the same ink and weight with *no* fill. It is the only thing left saying
 * where you are once a group is shut and its selected child is off screen.
 *
 * One level and no further — a third would need a row that is both a group
 * and a destination, which nothing has drawn. See DESIGNER_QUESTIONS.md #55.
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
 * The second level: where the branch rule stands, and where a child row
 * starts. Both measured from the left edge of the nav block rather than
 * of the rail, so the pair survives a change to the gutter.
 *
 * From the branched sidenav frame (1262:78156), which draws the rule at
 * 16 and the child at 32. The rule lands between the parent's glyph and
 * the child's, which is what makes the indent read as descent rather
 * than as a second list starting.
 *
 * Folded there is no width to indent into, so neither number applies and
 * the level moves into a flyout instead.
 */
const BRANCH_RULE_PX = 16;
const BRANCH_INDENT_PX = 32;

/**
 * Gap between the rail's edge and a folded parent's flyout.
 *
 * The frame stands the panel off the rail rather than flush against it —
 * its collapsed rail ends at 755 and the flyout starts at 763 — so the two
 * read as a panel *beside* the rail rather than a widening of it. `Scale/200`.
 */
const FLYOUT_OFFSET_PX = 8;

/**
 * How far past its anchor the flyout has to start.
 *
 * It is anchored to the *row's* right edge but has to clear the *rail's*,
 * and a folded row is a 28px square centred in a 64px panel — so the rail's
 * edge is half the leftover width further out, and anchoring alone leaves
 * the panel overlapping the rail by that much.
 *
 * Stepping over the remainder rather than anchoring to the rail itself,
 * because the anchor is also what gives the panel its vertical position:
 * it opens level with the row it belongs to, which a rail-wide anchor
 * would lose.
 */
const FLYOUT_ANCHOR_STEP_PX =
  (RAIL_COLLAPSED_PX - NAV_ROW_PX) / 2 + FLYOUT_OFFSET_PX;

/**
 * How long a folded parent's flyout survives the pointer leaving it.
 *
 * The panel stands 8px clear of the rail, so the pointer crosses ground
 * that belongs to neither: `mouseleave` fires on the row and `mouseenter`
 * on the panel only arrives after the gap. Nothing can be put in that gap
 * to carry the hover — the rail's paper clips on the x-axis to fold its
 * labels, and the flyout's paper clips to scroll a long list, so a bridge
 * from either side is cut off at exactly the edge it needs to cross.
 *
 * A timer is what is left, and it has to be generous rather than tight:
 * 8px is nothing to cross quickly and everything to cross while reading,
 * and a reader who pauses mid-gap should not have the panel taken away.
 * 300ms outlasts a deliberate move without leaving a panel hanging after
 * the pointer has truly gone.
 */
const FLYOUT_GRACE_MS = 300;

/**
 * The flyout is its own surface rather than a `Menu` in `Menu`'s clothes.
 *
 * The frame draws it at 240px on 8px corners with an 8px inset. The house
 * `Menu` is 16px corners on a 4px inset and takes its width from its widest
 * item — which is what made the first build read as a dropdown that had
 * wandered onto the rail rather than as a branch of it. `Menu` still does
 * the anchoring, the dismissal and the keyboard handling; the surface is
 * this.
 *
 * Colour and elevation stay tokenised where the frame left them unbound: it
 * fills with raw `white` behind a shadow roughly four times `Shadow/medium`.
 * `card 1` is the nearest rung above the `card 2` rail, and `medium` is the
 * house token for a floating panel. See DESIGNER_QUESTIONS.md #55.
 */
const FLYOUT_WIDTH_PX = 240;

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
 * The toggle's neutral selected fill is `surface.layers.card2` — which is
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

/** The flyout's panel. See `FLYOUT_WIDTH_PX` for why it is not `Menu`'s. */
function flyoutSurface(theme: Theme): CSSObject {
  return {
    width: FLYOUT_WIDTH_PX,
    maxWidth: FLYOUT_WIDTH_PX,
    borderRadius: `${radius.sm}px`,
    padding: `${FLYOUT_OFFSET_PX}px`,
    boxShadow: elevation.medium,
    backgroundColor: surface.layers.card1.light,
    borderColor: border.layers.card2.light,
    ...theme.applyStyles('dark', {
      backgroundColor: surface.layers.card1.dark,
      borderColor: border.layers.card2.dark,
    }),
  };
}

/**
 * A row inside the flyout, drawn as the rail's own row rather than as a
 * menu item: a 28px pill on 4px corners, an 8px inset, an 8px glyph gap,
 * and the same colour ladder.
 *
 * The frame instances the same row component in both places, which is the
 * point — a child reached through the flyout and the same child reached in
 * the open rail should be the same object, not two treatments of it.
 */
function flyoutRow(theme: Theme): CSSObject {
  return {
    minHeight: NAV_ROW_PX,
    height: NAV_ROW_PX,
    paddingInline: `${FLYOUT_OFFSET_PX}px`,
    gap: `${FLYOUT_OFFSET_PX}px`,
    borderRadius: `${radius.xs}px`,
    ...navRowStyles(theme),
  };
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
  /**
   * The level under this row, from the branched sidenav frame
   * (1262:78156).
   *
   * One level deep and no further. A row with children is a group rather
   * than a destination — it opens and closes instead of navigating — so
   * nesting a third level would need a row that is both, which nothing
   * has drawn.
   */
  children?: readonly RailItem[];
}

export const MAIN_NAV: readonly RailItem[] = [
  { key: 'dashboard', label: 'Dashboard', Icon: SquaresFourIcon },
  { key: 'analytics', label: 'Analytics', Icon: ChartLineIcon },
  {
    key: 'configuration',
    label: 'Configuration',
    Icon: GearSixIcon,
    children: [
      { key: 'rules', label: 'Validation rules', Icon: ScrollIcon },
      { key: 'documents', label: 'Document types', Icon: FileTextIcon },
    ],
  },
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
 * `surface.primary.default-pressed` behind `text.default.heading`, at
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
  onBranch = false,
  hasChildren = false,
  expanded = false,
  onMouseEnter,
  onMouseLeave,
}: {
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  selected: boolean;
  collapsed: boolean;
  onSelect: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * Pointer handlers, for the one row that has something to reveal on
   * hover other than a tooltip: a folded parent, whose flyout opens the
   * same way a folded leaf's tooltip does.
   */
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: () => void;
  /**
   * This row is the parent of the page you are on.
   *
   * Drawn in the selected row's ink and weight but with no fill, which is
   * the frame's own division of labour: the fill marks exactly one row,
   * and this says the current screen is somewhere inside this group. It
   * matters most when the group is shut and the selected child is not on
   * screen at all.
   */
  onBranch?: boolean;
  /** Carries a caret, and opens a level instead of navigating. */
  hasChildren?: boolean;
  expanded?: boolean;
}) {
  return (
    /* A folded parent gets no tooltip: its flyout opens on the same hover
       and already carries the name as a header, so a tooltip would be the
       same word twice, in two panels, overlapping. */
    <Tooltip title={collapsed && !hasChildren ? label : ''} placement="right">
      <ToggleButton
        value={label}
        selected={selected}
        onChange={onSelect}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        appearance="text"
        size="md"
        // Every other folded row is named by its tooltip. This one has
        // none, so the name is stated instead of lost — a folded parent is
        // a bare glyph, and its flyout only exists once hovered.
        aria-label={collapsed && hasChildren ? label : undefined}
        aria-expanded={hasChildren && !collapsed ? expanded : undefined}
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
          fontWeight: selected || onBranch ? 500 : 400,
          ...(onBranch && {
            color: text.default.body.light,
            ...theme.applyStyles('dark', { color: text.default.body.dark }),
          }),
          // A folded parent's hover target runs to the rail's edge, not
          // just to the pill's.
          //
          // The pill is a 28px square centred in a 64px rail, so 18px of
          // bare rail sits between it and the panel it opens — and leaving
          // the pill onto that strip reads to the DOM as leaving the row
          // entirely. Without this the flyout starts closing while the
          // pointer is still travelling towards it, over the rail, which is
          // the one place it has every reason to be.
          //
          // Transparent, so the fill stays the 28px square the design
          // draws. It stops at the rail's edge because the panel clips its
          // own overflow to fold the labels; the 8px beyond that is what
          // the grace period is for.
          ...(collapsed &&
            hasChildren && {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '100%',
                width: `${(RAIL_COLLAPSED_PX - NAV_ROW_PX) / 2}px`,
              },
            }),
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
        {/* A parent's caret is its only trailing part, so it takes the
            slack rather than sitting in the label's gap. Folded there is
            neither slack nor label — the glyph is the whole row, and the
            level it opens arrives beside the rail instead. */}
        {!collapsed && hasChildren && (
          <Box
            component="span"
            sx={(theme) => ({
              ml: 'auto',
              display: 'flex',
              transform: expanded ? 'none' : 'rotate(-90deg)',
              transition: theme.transitions.create('transform'),
            })}
          >
            <CaretDownIcon size={14} />
          </Box>
        )}
      </ToggleButton>
    </Tooltip>
  );
}

NavRow.displayName = 'NavRow';

/**
 * A parent row and the level under it.
 *
 * Expanded, the children reflow in beneath the parent behind the branch
 * rule. Folded, there is no width to indent into, so the same children
 * arrive in a flyout anchored to the parent's glyph — one level of
 * nesting, two places to put it, which is what keeps a folded rail from
 * dropping its second level on the floor.
 *
 * The flyout keeps the parent's name as a header, because the trigger at
 * that width is a bare glyph and two rows hanging off it say nothing
 * about which branch they belong to.
 */
function NavGroup({
  item,
  collapsed,
  active,
  onSelect,
}: {
  item: RailItem;
  collapsed: boolean;
  active: string;
  onSelect: (key: string) => void;
}) {
  const children = item.children ?? [];
  const onBranch = children.some((child) => child.key === active);
  const [expanded, setExpanded] = React.useState(onBranch);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // Arriving on the branch from anywhere else opens the group. Adjusted
  // during render rather than in an effect: it is state derived from a
  // change in `active`, so an effect would open the group a frame late and
  // cost a second pass. Tracking the previous value is what keeps it to
  // the transition — read directly, `onBranch` would force the group open
  // again every render and a reader could never shut a group they are
  // standing inside.
  const [wasOnBranch, setWasOnBranch] = React.useState(onBranch);
  if (onBranch !== wasOnBranch) {
    setWasOnBranch(onBranch);
    if (onBranch) setExpanded(true);
  }

  /**
   * Hover, with a grace period for crossing the seam.
   *
   * Leaving the glyph and entering the flyout are two events with a gap
   * between them, so closing on `mouseleave` alone would shut the panel
   * before the pointer could reach it. The close is scheduled instead, and
   * the panel's own `mouseenter` cancels it.
   */
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const holdFlyout = React.useCallback(() => {
    clearTimeout(closeTimer.current);
  }, []);

  const openFlyout = React.useCallback((element: HTMLElement) => {
    clearTimeout(closeTimer.current);
    setAnchorEl(element);
  }, []);

  const closeFlyout = React.useCallback(() => {
    clearTimeout(closeTimer.current);
    setAnchorEl(null);
  }, []);

  const closeFlyoutSoon = React.useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setAnchorEl(null), FLYOUT_GRACE_MS);
  }, []);

  // A pending close outliving the component would call setState on it.
  React.useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <>
      <NavRow
        label={item.label}
        Icon={item.Icon}
        collapsed={collapsed}
        selected={false}
        onBranch={onBranch}
        hasChildren
        expanded={expanded}
        // Hover is how a folded rail reveals anything, so it is how the
        // flyout opens. Click still works, because hover is not available
        // to a touch screen or a keyboard.
        onMouseEnter={
          collapsed ? (event) => openFlyout(event.currentTarget) : undefined
        }
        onMouseLeave={collapsed ? closeFlyoutSoon : undefined}
        onSelect={(event) => {
          if (collapsed) openFlyout(event.currentTarget);
          else setExpanded((previous) => !previous);
        }}
      />

      {!collapsed && (
        <Collapse in={expanded}>
          <Stack
            sx={(theme) => ({
              gap: 1,
              ml: `${BRANCH_RULE_PX}px`,
              pl: `${BRANCH_INDENT_PX - BRANCH_RULE_PX - 1}px`,
              borderLeft: '1px solid',
              // The `default` ladder, not `layers` — the same correction
              // #46 made for the selected row. The frame's rule is
              // `border.layers.card2`, which is a rung *off* the rail's own
              // `card 2` fill and measures 1.06:1 against it: drawn on the
              // canvas outside the rail, as this one was, that is never
              // visible. A branch nobody can see is not a branch.
              borderColor: border.default.default.light,
              ...theme.applyStyles('dark', {
                borderColor: border.default.default.dark,
              }),
            })}
          >
            {children.map(({ key, label, Icon }) => (
              <NavRow
                key={key}
                label={label}
                Icon={Icon}
                collapsed={false}
                selected={active === key}
                onSelect={() => onSelect(key)}
              />
            ))}
          </Stack>
        </Collapse>
      )}

      <Menu
        anchorEl={anchorEl}
        // Gated on `collapsed` as well as the anchor, so expanding the rail
        // dismisses the flyout on its own. The alternative is an effect
        // clearing the anchor, which fires after the glyph it points at has
        // already moved.
        open={collapsed && Boolean(anchorEl)}
        onClose={closeFlyout}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        // A hover panel must not take the pointer. The modal's backdrop
        // covers the whole viewport, so left alone it would swallow the
        // hover on every other glyph in the rail and the pointer could
        // never leave this row. The panel itself takes it back.
        sx={(theme) => ({
          pointerEvents: 'none',
          // The panel's own styles go here, not on `slotProps.paper`.
          // `Menu` paints its paper through a descendant selector, which
          // outranks the single class an `sx` on the paper generates — the
          // same specificity trap `Drawer` documents for its width. Written
          // as the same selector, so these actually land.
          '& .MuiMenu-paper': {
            pointerEvents: 'auto',
            ml: `${FLYOUT_ANCHOR_STEP_PX}px`,
            ...flyoutSurface(theme),
          },
        })}
        // The flyout is not a menu the reader committed to opening, so it
        // does not take focus off the rail on hover.
        disableAutoFocusItem
        disableRestoreFocus
        slotProps={{
          paper: {
            onMouseEnter: holdFlyout,
            onMouseLeave: closeFlyoutSoon,
          },
        }}
      >
        {/* The parent's name, then a rule, then the level. The frame heads
            the panel this way because the trigger is a bare glyph: without
            the name, two rows arrive from nowhere. */}
        <Box
          sx={(theme) => ({
            pb: `${FLYOUT_OFFSET_PX}px`,
            mb: `${FLYOUT_OFFSET_PX}px`,
            borderBottom: '1px solid',
            borderColor: border.layers.card2.light,
            ...theme.applyStyles('dark', {
              borderColor: border.layers.card2.dark,
            }),
          })}
        >
          <Typography
            variant="body2"
            noWrap
            sx={(theme) => ({
              fontWeight: fontWeights.medium,
              color: text.default.placeholder.light,
              ...theme.applyStyles('dark', {
                color: text.default.placeholder.dark,
              }),
            })}
          >
            {item.label}
          </Typography>
        </Box>
        <Stack sx={{ gap: `${radius.xs}px` }}>
          {children.map(({ key, label, Icon }) => (
            <MenuItem
              key={key}
              selected={active === key}
              onClick={() => {
                onSelect(key);
                closeFlyout();
              }}
              sx={flyoutRow}
            >
              <Icon size={16} />
              {label}
            </MenuItem>
          ))}
        </Stack>
      </Menu>
    </>
  );
}

NavGroup.displayName = 'NavGroup';

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
        {nav.map((item) =>
          item.children ? (
            <NavGroup
              key={item.key}
              item={item}
              collapsed={collapsed}
              active={active}
              onSelect={(key) => {
                setActive(key);
                onNavigate?.();
              }}
            />
          ) : (
            <NavRow
              key={item.key}
              label={item.label}
              Icon={item.Icon}
              collapsed={collapsed}
              selected={active === item.key}
              onSelect={() => {
                setActive(item.key);
                onNavigate?.();
              }}
            />
          )
        )}
      </Stack>

      <Stack sx={{ ...block, gap: 1, pb: 2, flexShrink: 0 }}>
        {secondaryNav.map((item) =>
          item.children ? (
            <NavGroup
              key={item.key}
              item={item}
              collapsed={collapsed}
              active={active}
              onSelect={(key) => {
                setActive(key);
                onNavigate?.();
              }}
            />
          ) : (
            <NavRow
              key={item.key}
              label={item.label}
              Icon={item.Icon}
              collapsed={collapsed}
              selected={active === item.key}
              onSelect={() => {
                setActive(item.key);
                onNavigate?.();
              }}
            />
          )
        )}
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
