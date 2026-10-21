'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';

import { NeofloLogo } from '@/src/brand';
import { Avatar } from '@/src/components/Avatar';
import { Collapse } from '@/src/components/Collapse';
import { Divider } from '@/src/components/Divider';
import { Drawer } from '@/src/components/Drawer';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@/src/components/List';
import { Menu } from '@/src/components/Menu';
import { MenuItem } from '@/src/components/MenuItem';
import { NAVBAR_HEIGHT_PX } from '@/src/components/Navbar';
import { Tooltip } from '@/src/components/Tooltip';
import {
  border,
  elevation,
  fontFamilies,
  fontWeights,
  icon,
  radius,
  surface,
  text,
  typography,
} from '@/src/tokens';
import {
  BriefcaseIcon,
  CaretDownIcon,
  CaretUpDownIcon,
  ChartLineIcon,
  ChatsIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  CurrencyCircleDollarIcon,
  DatabaseIcon,
  FileTextIcon,
  FilesIcon,
  GearIcon,
  HouseIcon,
  PlusIcon,
  QuestionIcon,
  ScrollIcon,
} from '@/src/icons';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { AvatarColor } from '@/src/components/Avatar';
import type { DrawerProps } from '@/src/components/Drawer';
import type { ModeToken } from '@/src/tokens';

/**
 * The app sidebar, rebuilt out of Atoms parts from the navigation sheet's
 * side nav bar (4564:6206).
 *
 * It is here rather than in the component because a drawer supplies the
 * panel and nothing inside it — so this is what "compose the contents"
 * actually looks like at full size, and it is the demo the Drawer and the
 * Navbar pages and every shell-level pattern show.
 *
 * Three blocks, top to bottom:
 *
 *   - **the brand**, 48px tall so the mark sits on the same line as the
 *     top bar beside it, 20px from the rail's edge;
 *   - **the nav**, which takes the slack: sections 16px apart, rows 4px
 *     apart inside a 12px inset, an optional mono label heading a section;
 *   - **the workspace switcher**, pinned to the foot behind a rule, which
 *     opens the workspace menu upwards.
 *
 * The sheet draws three states of it. The default rail; the same rail
 * with the workspace menu open (4564:6288); and a floating rail with no
 * brand, on 12px corners with a border all round and a shadow
 * (4564:10301), which is what `overlay` renders — the menu called up over
 * a workflow, where a page header already owns the top of the screen. The
 * same floating rail is what a hidden rail peeks as while its toggle is
 * hovered (4564:9280), which is `overlay` with `peek`.
 *
 * Collapsed, the inset comes off and every row centres on the rail's axis,
 * so the mark, the nav glyphs and the workspace avatar land on one line
 * despite being different widths. The main shell does not fold the rail —
 * its toggle hides it outright — so the folded strip is the workflow
 * screen's and the patterns'.
 *
 * ## No row component, yet
 *
 * The rows are `ButtonBase` — MUI's unstyled primitive — with the sheet's
 * treatment written here. No Atoms component draws a nav row: `MenuItem`
 * is the nearest, and it is a menu's option with a menu's ink and focus
 * model rather than a link to a page. An earlier build bent `ToggleButton`
 * into shape, and every value it drew — height, glyph, type, ink, fill —
 * had to be overridden to get there. See DESIGNER_QUESTIONS.md #71.
 *
 * ## The second level
 *
 * A row with `children` is a group rather than a destination: it opens and
 * closes instead of navigating, and it never takes the selected fill.
 * Expanded, the children reflow in behind a branch rule at a 40px indent;
 * folded, they arrive in a flyout anchored to the parent's glyph and headed
 * with the parent's name, because at 64px there is no width to indent into.
 *
 * A parent whose child is the current page takes the selected row's ink
 * and weight with *no* fill — but only while that child is out of sight,
 * in a shut group or a folded rail. The sheet draws the open group with a
 * plain parent, and once the child is on screen its own fill says where
 * you are.
 *
 * One level and no further — a third would need a row that is both a group
 * and a destination, which nothing has drawn. See DESIGNER_QUESTIONS.md #55.
 */

/** Rail width folded — a row's square plus the inset either side. */
const RAIL_COLLAPSED_PX = 64;

/** Inset around the nav block — `Scale/250`. */
const RAIL_INSET_PX = 12;

/** Inline inset of the brand block — `Scale/350`. */
const BRAND_INSET_PX = 20;

/**
 * Nav row geometry. The row itself — 28px, 8px in, the glyph 12px from
 * the label — is `ListItemButton`'s in a `nav` list; these are what the
 * rail still needs to know: the row's height to fold it to a square, the
 * glyph size, and the switcher's inset and gap, which match the rows.
 */
const NAV_ROW_PX = 28;
const NAV_ROW_INSET_PX = 8;
const NAV_GLYPH_PX = 16;
const NAV_GLYPH_GAP_PX = 12;

/** A parent's caret, and a section label's. */
const NAV_CARET_PX = 14;

/** Between sections — `Scale/300`. */
const NAV_SECTION_GAP_PX = 16;

/**
 * The workspace switcher: a 40px row (8 + 24px avatar + 8) inside a 4px
 * inline and 8px block inset, which puts the avatar 12px from the rail's
 * edge and the block at 56px — the same footprint as the sheet's resting
 * footer, whose row carries no padding of its own.
 */
const SWITCHER_ROW_PX = 40;
const SWITCHER_INSET_INLINE_PX = 4;
const SWITCHER_INSET_BLOCK_PX = 8;

/** Width of both flyouts — the workspace menu and a folded parent's level. */
const FLYOUT_WIDTH_PX = 240;

/**
 * Gap between the rail's edge and a folded parent's flyout, and between
 * the switcher and the workspace menu above it. `Scale/200`.
 */
const FLYOUT_OFFSET_PX = 8;

/**
 * How far past its anchor a folded parent's flyout has to start.
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
 * 300ms outlasts a deliberate move without leaving a panel hanging after
 * the pointer has truly gone.
 */
const FLYOUT_GRACE_MS = 300;

/**
 * Brand mark height; the lockup's wordmark scales from it.
 *
 * Atoms' `NeofloLogo` is cropped tight — its viewBox is the artwork — so
 * `size` is the visible mark. The sheet's mark measures 15.6 x 15.7, which
 * rounds to the house small-glyph size. One number for both states, so the
 * mark neither moves nor resizes when the rail folds.
 */
const LOGO_MARK_PX = 16;

/** The floating rail's inset from the region it floats over — `Scale/200`. */
const FLOAT_INSET_PX = 8;

type Mode = 'light' | 'dark';

/** One set of rules per scheme, landed in a single `applyStyles` block. */
function bothSchemes(
  theme: Theme,
  scheme: (mode: Mode) => CSSObject
): CSSObject {
  return { ...scheme('light'), ...theme.applyStyles('dark', scheme('dark')) };
}

/** Paint one property from a token, in both schemes. */
function ink(property: string, token: ModeToken) {
  return (theme: Theme): CSSObject =>
    bothSchemes(theme, (mode) => ({ [property]: token[mode] }));
}

/** `Sans/B1`, the type every row in the rail is set in. */
const B1_TYPE: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontSize: typography.body.b1.size,
  lineHeight: `${typography.body.b1.leading}px`,
  letterSpacing: `${typography.body.b1.letterSpacing}em`,
};

/** A caret that points down open and right shut. */
function Caret({ open, size }: { open: boolean; size: number }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={(theme) => ({
        display: 'flex',
        flexShrink: 0,
        transform: open ? 'none' : 'rotate(-90deg)',
        transition: theme.transitions.create('transform'),
      })}
    >
      <CaretDownIcon size={size} />
    </Box>
  );
}

Caret.displayName = 'Caret';

export interface RailItem {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  /**
   * The level under this row. One level deep and no further: a row with
   * children is a group rather than a destination — it opens and closes
   * instead of navigating — so nesting a third level would need a row that
   * is both, which nothing has drawn.
   */
  children?: readonly RailItem[];
}

/**
 * A run of rows, optionally under a label.
 *
 * The sheet heads its second run with "Workflows" in the mono section
 * label, and that label folds the run away. The first run has no label —
 * it is the app's own front doors, and there is nothing to call them.
 */
export interface RailSection {
  key: string;
  label?: string;
  items: readonly RailItem[];
}

/** The second level the sheet draws under Invoice Processing. */
function workflowPages(prefix: string): readonly RailItem[] {
  // The first workflow's pages keep bare keys, so a shell can name its
  // current page as `active="work-area"` rather than a qualified path.
  const key = (page: string) => (prefix ? `${prefix}-${page}` : page);
  return [
    { key: key('work-area'), label: 'Work area', Icon: BriefcaseIcon },
    { key: key('analytics'), label: 'Analytics', Icon: ChartLineIcon },
    { key: key('memory'), label: 'Memory', Icon: DatabaseIcon },
    { key: key('supporting-doc'), label: 'Supporting doc', Icon: FileTextIcon },
    { key: key('settings'), label: 'Settings', Icon: GearIcon },
  ];
}

/**
 * The main menu, as the sheet lists it: Home and Sources, then the
 * workflows. Collections and Vendor Query are drawn shut, with a caret;
 * they carry the same pages as the open one so the caret has something to
 * open.
 */
export const MAIN_NAV: readonly RailSection[] = [
  {
    key: 'app',
    items: [
      { key: 'home', label: 'Home', Icon: HouseIcon },
      { key: 'sources', label: 'Sources', Icon: FilesIcon },
    ],
  },
  {
    key: 'workflows',
    label: 'Workflows',
    items: [
      {
        key: 'invoice-processing',
        label: 'Invoice Processing',
        Icon: FileTextIcon,
        children: workflowPages(''),
      },
      {
        key: 'collections',
        label: 'Collections',
        Icon: CurrencyCircleDollarIcon,
        children: workflowPages('collections'),
      },
      {
        key: 'vendor-query',
        label: 'Vendor Query',
        Icon: ChatsIcon,
        children: workflowPages('vendor-query'),
      },
    ],
  },
];

/**
 * The workflow rail's own items, from the workflow frame (879:24324):
 * `Scroll`, `FileText` and `ClockCounterClockwise`, with `Question` alone in
 * the group at the bottom.
 *
 * A different set from the main menu's, and that is the point — inside a
 * workflow the rail moves between *sections of the record*, not between
 * destinations in the app. Leaving is what the hamburger and the main menu
 * are for.
 */
export const WORKFLOW_NAV: readonly RailSection[] = [
  {
    key: 'record',
    items: [
      { key: 'invoice', label: 'Invoice', Icon: ScrollIcon },
      { key: 'documents', label: 'Documents', Icon: FileTextIcon },
      { key: 'history', label: 'History', Icon: ClockCounterClockwiseIcon },
    ],
  },
];

export const WORKFLOW_SECONDARY_NAV: readonly RailItem[] = [
  { key: 'help', label: 'Help', Icon: QuestionIcon },
];

interface Workspace {
  key: string;
  name: string;
  initials: string;
  color: AvatarColor;
}

/** The switcher's workspaces, in the sheet's colours: primary, then green. */
const WORKSPACES: readonly Workspace[] = [
  { key: 'finance', name: 'Finance', initials: 'FI', color: 'primary' },
  { key: 'procurement', name: 'Procurement', initials: 'PR', color: 'success' },
];

/**
 * One nav row: `ListItemButton` in the `nav` list, which draws the 28px
 * row, its ink and its states. Folded, the row is its glyph alone — a
 * 28px square on the rail's axis, as MUI's mini drawer centres it.
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
  /** This row is the parent of a current page that is out of sight. */
  onBranch?: boolean;
  /** Carries a caret, and opens a level instead of navigating. */
  hasChildren?: boolean;
  expanded?: boolean;
  /**
   * Pointer handlers, for the one row that has something to reveal on
   * hover other than a tooltip: a folded parent, whose flyout opens the
   * same way a folded leaf's tooltip does.
   */
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: () => void;
}) {
  return (
    /* A folded parent gets no tooltip: its flyout opens on the same hover
       and already carries the name as a header. */
    <Tooltip title={collapsed && !hasChildren ? label : ''} placement="right">
      <ListItemButton
        selected={selected}
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-current={selected ? 'page' : onBranch ? 'true' : undefined}
        // Every other folded row is named by its tooltip. A folded parent
        // has none, so the name is stated instead of lost.
        aria-label={collapsed && hasChildren ? label : undefined}
        aria-expanded={hasChildren && !collapsed ? expanded : undefined}
        sx={
          collapsed
            ? {
                width: NAV_ROW_PX,
                alignSelf: 'center',
                justifyContent: 'center',
                px: 0,
                // A folded parent's hover target runs to the rail's edge,
                // so the pointer is not leaving the row while it crosses
                // the bare rail towards the flyout. Transparent, so the
                // fill stays the 28px square.
                ...(hasChildren && {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '100%',
                    width: `${(RAIL_COLLAPSED_PX - NAV_ROW_PX) / 2}px`,
                  },
                }),
              }
            : undefined
        }
      >
        <ListItemIcon>
          <Icon size={NAV_GLYPH_PX} />
        </ListItemIcon>
        {!collapsed && <ListItemText primary={label} />}
        {!collapsed && hasChildren && (
          <Caret open={expanded} size={NAV_CARET_PX} />
        )}
      </ListItemButton>
    </Tooltip>
  );
}

NavRow.displayName = 'NavRow';

/**
 * A parent row and the level under it.
 *
 * Expanded, the children are a nested `List` in a `Collapse` — MUI's own
 * nested-list composition — which the `nav` list draws behind a branch
 * rule at a 40px indent. Folded, the same children arrive in a flyout
 * anchored to the parent's glyph — one level of nesting, two places to
 * put it.
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
  // change in `active`, so an effect would open the group a frame late.
  // Tracking the previous value keeps it to the transition, so a reader
  // can still shut a group they are standing inside.
  const [wasOnBranch, setWasOnBranch] = React.useState(onBranch);
  if (onBranch !== wasOnBranch) {
    setWasOnBranch(onBranch);
    if (onBranch) setExpanded(true);
  }

  /**
   * Hover, with a grace period for crossing the seam. The close is
   * scheduled on `mouseleave`, and the panel's own `mouseenter` cancels it.
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

  // A fragment rather than a wrapper: the row and its `Collapse` are both
  // children of the `nav` list, which is what spaces them.
  return (
    <>
      <NavRow
        label={item.label}
        Icon={item.Icon}
        collapsed={collapsed}
        selected={false}
        onBranch={onBranch && (collapsed || !expanded)}
        hasChildren
        expanded={expanded}
        // Hover is how a folded rail reveals anything, so it is how the
        // flyout opens. Click still works, for touch and the keyboard.
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
          <List component="div">
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
          </List>
        </Collapse>
      )}

      <Menu
        anchorEl={anchorEl}
        // Gated on `collapsed` as well, so expanding the rail dismisses the
        // flyout on its own.
        open={collapsed && Boolean(anchorEl)}
        onClose={closeFlyout}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        // A hover panel must not take the pointer: the modal's backdrop
        // would swallow the hover on every other glyph in the rail. The
        // panel itself takes it back. Written through `Menu`'s own panel
        // selector, which is the one that outranks the wrapper's styles.
        sx={{
          pointerEvents: 'none',
          '& .MuiMenu-paper': {
            pointerEvents: 'auto',
            ml: `${FLYOUT_ANCHOR_STEP_PX}px`,
            width: FLYOUT_WIDTH_PX,
          },
        }}
        // Not a menu the reader committed to opening, so it does not take
        // focus off the rail on hover.
        disableAutoFocusItem
        disableRestoreFocus
        slotProps={{
          paper: {
            onMouseEnter: holdFlyout,
            onMouseLeave: closeFlyoutSoon,
          },
        }}
      >
        {/* The parent's name heads the panel, because the trigger is a bare
            glyph: without it, the rows arrive from nowhere. */}
        <ListSubheader>{item.label}</ListSubheader>
        {children.map(({ key, label, Icon }) => (
          <MenuItem
            key={key}
            selected={active === key}
            onClick={() => {
              onSelect(key);
              closeFlyout();
            }}
          >
            <Icon size={NAV_GLYPH_PX} />
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

NavGroup.displayName = 'NavGroup';

/** Rows, as leaves or groups. */
function navItems(
  items: readonly RailItem[],
  collapsed: boolean,
  active: string,
  onSelect: (key: string) => void
) {
  return items.map((item) =>
    item.children ? (
      <NavGroup
        key={item.key}
        item={item}
        collapsed={collapsed}
        active={active}
        onSelect={onSelect}
      />
    ) : (
      <NavRow
        key={item.key}
        label={item.label}
        Icon={item.Icon}
        collapsed={collapsed}
        selected={active === item.key}
        onSelect={() => onSelect(item.key)}
      />
    )
  );
}

/**
 * A section: a `nav` list, under a mono label that folds its rows away.
 *
 * The label is `ListSubheader` rendered as a button, and the rows sit in
 * a `Collapse` straight inside the list, which keeps them 4px apart.
 * Folded, the label goes — there is no width for it — and the rows stay
 * out, so a collapsed rail never hides a page behind a label it cannot
 * show.
 */
function NavSection({
  section,
  collapsed,
  active,
  onSelect,
}: {
  section: RailSection;
  collapsed: boolean;
  active: string;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const rows = navItems(section.items, collapsed, active, onSelect);
  const labelled = Boolean(section.label) && !collapsed;

  return (
    <List
      variant="nav"
      component="div"
      sx={collapsed ? { alignItems: 'center' } : undefined}
    >
      {labelled && (
        <ListSubheader
          component="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={open}
        >
          {section.label}
          <Caret open={open} size={NAV_CARET_PX} />
        </ListSubheader>
      )}
      {labelled ? <Collapse in={open}>{rows}</Collapse> : rows}
    </List>
  );
}

NavSection.displayName = 'NavSection';

/**
 * The workspace switcher at the foot of the rail, and the menu it opens.
 *
 * The trigger is the current workspace — its avatar on the `mid` square,
 * its name in `Sans/B1/Medium`, and an up-down caret saying the list opens
 * on either side. The menu opens upwards off it, 8px clear, and is the
 * sheet's flyout: a `Workspaces` label, a row per workspace with the
 * current one filled and checked, and "Create workspace" behind a rule.
 */
function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const [current, setCurrent] = React.useState(WORKSPACES[0].key);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const workspace =
    WORKSPACES.find((space) => space.key === current) ?? WORKSPACES[0];
  const close = () => setAnchorEl(null);

  const trigger = (
    <ButtonBase
      onClick={(event) => setAnchorEl(event.currentTarget)}
      aria-haspopup="menu"
      aria-expanded={Boolean(anchorEl)}
      aria-label={collapsed ? workspace.name : undefined}
      sx={(theme) => ({
        ...B1_TYPE,
        fontWeight: fontWeights.medium,
        width: collapsed ? SWITCHER_ROW_PX : '100%',
        height: SWITCHER_ROW_PX,
        p: collapsed ? 0 : `${NAV_ROW_INSET_PX}px`,
        gap: `${NAV_GLYPH_GAP_PX}px`,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: `${radius.xs}px`,
        whiteSpace: 'nowrap',
        '& .MuiAvatar-root, & svg': { flexShrink: 0 },
        ...bothSchemes(theme, (mode) => ({
          color: text.default.b1[mode],
          '&:hover, &.Mui-focusVisible, &[aria-expanded="true"]': {
            backgroundColor: surface.layers.card3[mode],
          },
        })),
      })}
    >
      <Avatar size="sm" shape="mid" color={workspace.color}>
        {workspace.initials}
      </Avatar>
      {!collapsed && (
        <>
          <Box
            component="span"
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'left',
            }}
          >
            {workspace.name}
          </Box>
          <Box
            component="span"
            sx={(theme) => ({
              display: 'flex',
              ...ink('color', icon.default.b3)(theme),
            })}
          >
            <CaretUpDownIcon size={NAV_GLYPH_PX} />
          </Box>
        </>
      )}
    </ButtonBase>
  );

  return (
    <Box
      sx={(theme) => ({
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        px: collapsed ? 0 : `${SWITCHER_INSET_INLINE_PX}px`,
        py: `${SWITCHER_INSET_BLOCK_PX}px`,
        borderTop: '1px solid',
        // `card 3`'s edge, as the sheet binds it: a rung darker than the
        // rail's own `card 2` edge in dark mode, so the rule reads there.
        ...ink('borderColor', border.layers.card3)(theme),
      })}
    >
      {collapsed ? (
        <Tooltip title={workspace.name} placement="right">
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{
          '& .MuiMenu-paper': {
            width: FLYOUT_WIDTH_PX,
            mt: `-${FLYOUT_OFFSET_PX}px`,
            ml: `${FLYOUT_OFFSET_PX}px`,
          },
        }}
      >
        <ListSubheader>Workspaces</ListSubheader>
        {WORKSPACES.map((space) => (
          <MenuItem
            key={space.key}
            selected={space.key === current}
            onClick={() => {
              setCurrent(space.key);
              close();
            }}
          >
            <Avatar size="sm" shape="mid" color={space.color}>
              {space.initials}
            </Avatar>
            <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
              {space.name}
            </Box>
            {space.key === current && (
              <Box
                component="span"
                sx={(theme) => ({
                  display: 'flex',
                  ...ink('color', icon.success[4])(theme),
                })}
              >
                <CheckCircleIcon size={NAV_GLYPH_PX} />
              </Box>
            )}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={close}>
          <PlusIcon size={NAV_GLYPH_PX} />
          Create workspace
        </MenuItem>
      </Menu>
    </Box>
  );
}

WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';

/**
 * The rail. `collapsed` resolves to a `size` in pixels rather than a name
 * off the scale: a folded rail is the same panel narrowed, so it is the
 * same prop with a different number, and the width animates on its own.
 */
export function AppRail({
  collapsed = false,
  showBrand = true,
  showWorkspace = true,
  overlay = false,
  peekProps,
  open = false,
  onClose,
  onNavigate,
  active: activeProp,
  onActiveChange,
  nav = MAIN_NAV,
  secondaryNav = [],
  defaultActive,
  container,
}: {
  collapsed?: boolean;
  /**
   * Float over the page instead of reserving space beside it — a
   * `temporary` drawer rather than a `permanent` one, drawn as the sheet's
   * floating rail: no brand, 12px corners, a border all round, and a
   * shadow, inset 8px from the region it floats over.
   *
   * The page header uses this: that bar spans the whole screen, so the
   * navigation under it is something you summon and dismiss rather than a
   * column the layout is built around.
   *
   * @default false
   */
  overlay?: boolean;
  /**
   * Render as the hidden rail's peek: the `peekProps` from
   * `useSidebarToggle`, which float the rail in under the bar while its
   * toggle is hovered. Drawn as the floating rail, with no brand.
   */
  peekProps?: DrawerProps;
  /** Whether the overlay is showing. Ignored unless `overlay`. */
  open?: boolean;
  onClose?: () => void;
  /**
   * Fired when a nav row is picked. An overlay should close on navigation
   * — it covers what you just chose to look at — where a docked rail stays
   * put, so this is passed only by the overlay case.
   */
  onNavigate?: () => void;
  /** The selected row, lifted out so a shell can drive it. */
  active?: string;
  onActiveChange?: (key: string) => void;
  /**
   * Which sections the rail carries. The main menu's by default; a
   * workflow strip passes `WORKFLOW_NAV`, whose rows are sections of the
   * record rather than destinations in the app.
   */
  nav?: readonly RailSection[];
  /** A group pinned above the foot of the rail. None in the main menu. */
  secondaryNav?: readonly RailItem[];
  /** Which row starts selected. Defaults to the first. */
  defaultActive?: string;
  /**
   * The workspace switcher at the foot. The workflow strip drops it — a
   * strip for moving around one record has no business switching
   * workspace, which is reachable from the main menu the hamburger brings
   * back.
   *
   * @default true
   */
  showWorkspace?: boolean;
  /**
   * Where the overlay renders. A `temporary` drawer is a `Modal`, which
   * portals to `document.body` and pins itself to the viewport — correct
   * in an app, wrong inside a docs preview. Passing the preview's own box
   * keeps it in the frame.
   */
  container?: HTMLElement | null;
  /**
   * The brand block. Dropped on the workflow strip, which hangs under a
   * page header that already owns the top of the screen, and never drawn
   * on the overlay, which floats under that same header.
   *
   * @default true
   */
  showBrand?: boolean;
}) {
  const [uncontrolledActive, setUncontrolledActive] = React.useState(
    defaultActive ?? nav[0]?.items[0]?.key ?? ''
  );
  const active = activeProp ?? uncontrolledActive;
  const setActive = onActiveChange ?? setUncontrolledActive;
  const select = (key: string) => {
    setActive(key);
    onNavigate?.();
  };
  const brand = showBrand && !overlay && !peekProps;

  const contents = (
    <>
      {brand && (
        <Box
          sx={{
            height: NAVBAR_HEIGHT_PX.sm,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : `${BRAND_INSET_PX}px`,
            color: 'text.primary',
          }}
        >
          <NeofloLogo
            variant={collapsed ? 'mark' : 'full'}
            size={LOGO_MARK_PX}
          />
        </Box>
      )}

      {/* The nav takes the slack, which is what pins the switcher to the
          foot of the rail. */}
      <Stack
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          gap: `${NAV_SECTION_GAP_PX}px`,
          px: collapsed ? 0 : `${RAIL_INSET_PX}px`,
          py: `${RAIL_INSET_PX}px`,
        }}
      >
        {nav.map((section) => (
          <NavSection
            key={section.key}
            section={section}
            collapsed={collapsed}
            active={active}
            onSelect={select}
          />
        ))}
      </Stack>

      {secondaryNav.length > 0 && (
        <Box
          sx={{
            flexShrink: 0,
            px: collapsed ? 0 : `${RAIL_INSET_PX}px`,
            pb: `${RAIL_INSET_PX}px`,
          }}
        >
          <List
            variant="nav"
            component="div"
            sx={collapsed ? { alignItems: 'center' } : undefined}
          >
            {navItems(secondaryNav, collapsed, active, select)}
          </List>
        </Box>
      )}

      {showWorkspace && <WorkspaceSwitcher collapsed={collapsed} />}
    </>
  );

  // The hidden rail's peek: the hook's own temporary drawer, floating.
  if (peekProps) {
    return (
      <Drawer size="sm" {...peekProps}>
        {contents}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={overlay ? 'temporary' : 'permanent'}
      open={overlay ? open : undefined}
      onClose={overlay ? onClose : undefined}
      // The folded width is state, not a fourth rung on the scale — and it
      // goes on `size` rather than on the paper, because it has to reach
      // the space the rail reserves as well as the panel itself.
      size={collapsed ? RAIL_COLLAPSED_PX : 'sm'}
      // The floating rail. Written through the drawer's own paper selector,
      // which is the one that outranks the edge and corners `Drawer` draws:
      // the sheet's floating rail has a border all round and 12px corners
      // where a docked one has a single hairline and none.
      sx={
        overlay
          ? {
              '& .MuiDrawer-paper': {
                m: `${FLOAT_INSET_PX}px`,
                height: `calc(100% - ${FLOAT_INSET_PX * 2}px)`,
                borderWidth: 1,
                borderRadius: `${radius.md}px`,
                boxShadow: elevation.large,
              },
            }
          : undefined
      }
      slotProps={{
        // `absolute` rather than `relative` for the overlay, so the panel
        // pins to the preview box the modal is rendered into; a docked
        // panel is put back in normal flow instead. Neither is MUI's
        // default `fixed`, which belongs to the viewport.
        paper: {
          sx: { position: overlay ? 'absolute' : 'relative' },
        },
        // The backdrop needs the same treatment as the root, and
        // separately: MUI's is `position: fixed` in its own right.
        ...(overlay && container
          ? {
              root: { container, sx: { position: 'absolute' } },
              backdrop: { sx: { position: 'absolute' } },
            }
          : {}),
      }}
    >
      {contents}
    </Drawer>
  );
}

AppRail.displayName = 'AppRail';
