/**
 * The dashboard pattern, as a page a consumer can paste.
 *
 * Kept in its own file because it is one long string and the metadata
 * around it is short — and because `get_pattern` promises "the full page
 * layout code", so this is the deliverable rather than an excerpt of one.
 *
 * It also carries the app's rail in full — sections, a second level, the
 * workspace switcher, the folded strip and the floating rail — because
 * every other pattern imports that rail from `./AppRail` rather than
 * redrawing it, and this is where it is written out. The rows are
 * `List variant="nav"` and the hide-and-peek toggle is `useSidebarToggle`,
 * both from the library. A snippet that referenced a rail the reader does not have would
 * hand back half a screen.
 *
 * What is left to the reader is the data — the rows, the columns and the
 * facet options — because those are the application. Everything that is
 * layout is here.
 */
export const dashboardCode = `'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  DataGrid,
  Divider,
  Drawer,
  Filter,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  NAVBAR_HEIGHT_PX,
  Navbar,
  NeofloLogo,
  Stack,
  TextField,
  Tooltip,
  Typography,
  atomsRegion,
  countActiveFilters,
  useSidebarToggle,
} from '@neofloai/atoms';
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
  FadersHorizontalIcon,
  FileTextIcon,
  FilesIcon,
  GearIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QuestionIcon,
  ScrollIcon,
  SidebarSimpleIcon,
} from '@neofloai/atoms/icons';
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
} from '@neofloai/atoms/tokens';
import { neofloTheme } from '@neofloai/atoms/theme';

import type { AvatarColor, DrawerProps, FilterValue } from '@neofloai/atoms';
import type { ModeToken } from '@neofloai/atoms/tokens';
import { QUERY_COLUMNS, QUERY_ROWS, filterQueries } from './queries';
import { FILTER_GROUPS } from './facets';

/* ================================================================== *
 * The rail                                                           *
 *                                                                    *
 * Everything from here to "The page" is the app's sidebar. Move it   *
 * into ./AppRail.tsx and export AppRail, WORKFLOW_NAV and            *
 * WORKFLOW_SECONDARY_NAV: the other patterns import those from there *
 * rather than redrawing the rail.                                    *
 * ================================================================== */

type Theme = typeof neofloTheme;
type Mode = 'light' | 'dark';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Styles = Record<string, any>;

/** Rail width folded to icons — a workflow screen's strip. */
const RAIL_COLLAPSED_PX = 64;

/** Inset around the nav block. */
const RAIL_INSET_PX = 12;

/** Inline inset of the brand block. */
const BRAND_INSET_PX = 20;

/**
 * Nav row geometry. The row itself — 28px, 8px in, the glyph 12px from
 * the label — is \`ListItemButton\`'s in a \`nav\` list; these are what the
 * rail still needs: the row's height to fold it to a square, the glyph,
 * and the switcher's inset and gap, which match the rows.
 */
const NAV_ROW_PX = 28;
const NAV_ROW_INSET_PX = 8;
const NAV_GLYPH_PX = 16;
const NAV_GLYPH_GAP_PX = 12;
const NAV_CARET_PX = 14;

/** Between sections. */
const NAV_SECTION_GAP_PX = 16;

/** The workspace switcher: a 40px row inside a 4px / 8px inset. */
const SWITCHER_ROW_PX = 40;
const SWITCHER_INSET_INLINE_PX = 4;
const SWITCHER_INSET_BLOCK_PX = 8;

/** Both flyouts — the workspace menu and a folded parent's level. */
const FLYOUT_WIDTH_PX = 240;
const FLYOUT_OFFSET_PX = 8;

/**
 * How far past its anchor a folded parent's flyout starts. It is anchored
 * to the row, a 28px square centred in a 64px rail, but has to clear the
 * rail's edge — half the leftover width further out.
 */
const FLYOUT_ANCHOR_STEP_PX =
  (RAIL_COLLAPSED_PX - NAV_ROW_PX) / 2 + FLYOUT_OFFSET_PX;

/**
 * How long a folded parent's flyout survives the pointer leaving it. It
 * stands clear of the rail, so the pointer crosses a gap that belongs to
 * neither, and a timer is what carries it across.
 */
const HOVER_GRACE_MS = 300;

/** The brand mark's height; the wordmark scales from it. */
const LOGO_MARK_PX = 16;

/** The floating rail's inset from the region it floats over. */
const FLOAT_INSET_PX = 8;

/** One set of rules per scheme, landed in a single \`applyStyles\` block. */
function bothSchemes(theme: Theme, scheme: (mode: Mode) => Styles): Styles {
  return {
    ...scheme('light'),
    ...(theme.applyStyles('dark', scheme('dark')) as Styles),
  };
}

/** Paint one property from a token, in both schemes. */
function ink(property: string, token: ModeToken) {
  return (theme: Theme): Styles =>
    bothSchemes(theme, (mode) => ({ [property]: token[mode] }));
}

/** \`Sans/B1\`, the type every row in the rail is set in. */
const B1_TYPE = {
  fontFamily: fontFamilies.product.sans,
  fontSize: typography.body.b1.size,
  lineHeight: \`\${typography.body.b1.leading}px\`,
  letterSpacing: \`\${typography.body.b1.letterSpacing}em\`,
};

/**
 * A native button with the browser's own styling taken off — what the
 * workspace switcher's trigger is built on. The nav rows are
 * \`ListItemButton\`s in a \`nav\` list.
 */
const BUTTON_RESET: Styles = {
  appearance: 'none',
  margin: 0,
  border: 0,
  background: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
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

interface RailItem {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  /**
   * The level under this row. One level and no further: a row with
   * children opens and closes rather than navigating.
   */
  children?: readonly RailItem[];
}

/** A run of rows, optionally under a mono label that folds them away. */
interface RailSection {
  key: string;
  label?: string;
  items: readonly RailItem[];
}

/** The pages under each workflow. */
function workflowPages(prefix: string): readonly RailItem[] {
  const key = (page: string) => (prefix ? \`\${prefix}-\${page}\` : page);
  return [
    { key: key('work-area'), label: 'Work area', Icon: BriefcaseIcon },
    { key: key('analytics'), label: 'Analytics', Icon: ChartLineIcon },
    { key: key('memory'), label: 'Memory', Icon: DatabaseIcon },
    { key: key('supporting-doc'), label: 'Supporting doc', Icon: FileTextIcon },
    { key: key('settings'), label: 'Settings', Icon: GearIcon },
  ];
}

/** The main menu: the app's front doors, then the workflows. */
const MAIN_NAV: readonly RailSection[] = [
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
 * Inside a workflow the rail moves between sections of the record, not
 * between destinations in the app — a different set of rows.
 */
const WORKFLOW_NAV: readonly RailSection[] = [
  {
    key: 'record',
    items: [
      { key: 'invoice', label: 'Invoice', Icon: ScrollIcon },
      { key: 'documents', label: 'Documents', Icon: FileTextIcon },
      { key: 'history', label: 'History', Icon: ClockCounterClockwiseIcon },
    ],
  },
];

const WORKFLOW_SECONDARY_NAV: readonly RailItem[] = [
  { key: 'help', label: 'Help', Icon: QuestionIcon },
];

interface Workspace {
  key: string;
  name: string;
  initials: string;
  color: AvatarColor;
}

const WORKSPACES: readonly Workspace[] = [
  { key: 'finance', name: 'Finance', initials: 'FI', color: 'primary' },
  { key: 'procurement', name: 'Procurement', initials: 'PR', color: 'success' },
];

/**
 * One nav row: \`ListItemButton\` in the \`nav\` list, which draws the 28px
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
                    width: \`\${(RAIL_COLLAPSED_PX - NAV_ROW_PX) / 2}px\`,
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


/**
 * A parent row and the level under it.
 *
 * Expanded, the children are a nested \`List\` in a \`Collapse\` — MUI's own
 * nested-list composition — which the \`nav\` list draws behind a branch
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
  // change in \`active\`, so an effect would open the group a frame late.
  // Tracking the previous value keeps it to the transition, so a reader
  // can still shut a group they are standing inside.
  const [wasOnBranch, setWasOnBranch] = React.useState(onBranch);
  if (onBranch !== wasOnBranch) {
    setWasOnBranch(onBranch);
    if (onBranch) setExpanded(true);
  }

  /**
   * Hover, with a grace period for crossing the seam. The close is
   * scheduled on \`mouseleave\`, and the panel's own \`mouseenter\` cancels it.
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
    closeTimer.current = setTimeout(() => setAnchorEl(null), HOVER_GRACE_MS);
  }, []);

  // A pending close outliving the component would call setState on it.
  React.useEffect(() => () => clearTimeout(closeTimer.current), []);

  // A fragment rather than a wrapper: the row and its \`Collapse\` are both
  // children of the \`nav\` list, which is what spaces them.
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
        // Gated on \`collapsed\` as well, so expanding the rail dismisses the
        // flyout on its own.
        open={collapsed && Boolean(anchorEl)}
        onClose={closeFlyout}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        // A hover panel must not take the pointer: the modal's backdrop
        // would swallow the hover on every other glyph in the rail. The
        // panel itself takes it back. Written through \`Menu\`'s own panel
        // selector, which is the one that outranks the wrapper's styles.
        sx={{
          pointerEvents: 'none',
          '& .MuiMenu-paper': {
            pointerEvents: 'auto',
            ml: \`\${FLYOUT_ANCHOR_STEP_PX}px\`,
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
 * A section: a \`nav\` list, under a mono label that folds its rows away.
 *
 * The label is \`ListSubheader\` rendered as a button, and the rows sit in
 * a \`Collapse\` straight inside the list, which keeps them 4px apart.
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


/**
 * The workspace switcher at the foot of the rail, and the menu it opens
 * upwards: a Workspaces label, a row per workspace with the current one
 * filled and checked, and Create workspace behind a rule.
 */
function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const [current, setCurrent] = React.useState(WORKSPACES[0].key);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const workspace =
    WORKSPACES.find((space) => space.key === current) ?? WORKSPACES[0];
  const close = () => setAnchorEl(null);

  const trigger = (
    <Box
      component="button"
      type="button"
      onClick={(event: React.MouseEvent<HTMLElement>) =>
        setAnchorEl(event.currentTarget)
      }
      aria-haspopup="menu"
      aria-expanded={Boolean(anchorEl)}
      aria-label={collapsed ? workspace.name : undefined}
      sx={(theme) => ({
        ...BUTTON_RESET,
        ...B1_TYPE,
        fontWeight: fontWeights.medium,
        width: collapsed ? SWITCHER_ROW_PX : '100%',
        height: SWITCHER_ROW_PX,
        p: collapsed ? 0 : \`\${NAV_ROW_INSET_PX}px\`,
        gap: \`\${NAV_GLYPH_GAP_PX}px\`,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: \`\${radius.xs}px\`,
        whiteSpace: 'nowrap',
        '& .MuiAvatar-root, & svg': { flexShrink: 0 },
        ...bothSchemes(theme, (mode) => ({
          color: text.default.b1[mode],
          '&:hover, &:focus-visible, &[aria-expanded="true"]': {
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
    </Box>
  );

  return (
    <Box
      sx={(theme) => ({
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        px: collapsed ? 0 : \`\${SWITCHER_INSET_INLINE_PX}px\`,
        py: \`\${SWITCHER_INSET_BLOCK_PX}px\`,
        borderTop: '1px solid',
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
            mt: \`-\${FLYOUT_OFFSET_PX}px\`,
            ml: \`\${FLYOUT_OFFSET_PX}px\`,
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

interface AppRailProps {
  /** Folded to the 64px icon strip — a workflow screen's rail. */
  collapsed?: boolean;
  /** The brand block. Off under a page header that owns the top. */
  showBrand?: boolean;
  /** The workspace switcher at the foot. Off on a workflow strip. */
  showWorkspace?: boolean;
  /**
   * Float over the page instead of reserving space beside it: no brand,
   * 12px corners, a border all round and a shadow, inset 8px.
   */
  overlay?: boolean;
  /**
   * Render as the hidden rail's peek: the \`peekProps\` from
   * \`useSidebarToggle\`, which float the rail in under the bar while its
   * toggle is hovered.
   */
  peekProps?: DrawerProps;
  open?: boolean;
  onClose?: () => void;
  /** Fired when a row is picked. An overlay passes its own close. */
  onNavigate?: () => void;
  active?: string;
  onActiveChange?: (key: string) => void;
  defaultActive?: string;
  nav?: readonly RailSection[];
  /** A group pinned above the foot. None in the main menu. */
  secondaryNav?: readonly RailItem[];
  /** Where an overlay renders, to keep it inside a region of the page. */
  container?: HTMLElement | null;
}

/**
 * The rail: brand, the nav taking the slack, and the workspace switcher
 * pinned to the foot behind a rule.
 */
function AppRail({
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
  defaultActive,
  nav = MAIN_NAV,
  secondaryNav = [],
  container,
}: AppRailProps) {
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
            px: collapsed ? 0 : \`\${BRAND_INSET_PX}px\`,
            color: 'text.primary',
          }}
        >
          <NeofloLogo
            variant={collapsed ? 'mark' : 'full'}
            size={LOGO_MARK_PX}
          />
        </Box>
      )}

      {/* The nav takes the slack, which pins the switcher to the foot. */}
      <Stack
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          gap: \`\${NAV_SECTION_GAP_PX}px\`,
          px: collapsed ? 0 : \`\${RAIL_INSET_PX}px\`,
          py: \`\${RAIL_INSET_PX}px\`,
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
            px: collapsed ? 0 : \`\${RAIL_INSET_PX}px\`,
            pb: \`\${RAIL_INSET_PX}px\`,
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
      size={collapsed ? RAIL_COLLAPSED_PX : 'sm'}
      sx={
        overlay
          ? {
              '& .MuiDrawer-paper': {
                m: \`\${FLOAT_INSET_PX}px\`,
                height: \`calc(100% - \${FLOAT_INSET_PX * 2}px)\`,
                borderWidth: 1,
                borderRadius: \`\${radius.md}px\`,
                boxShadow: elevation.large,
              },
            }
          : undefined
      }
      slotProps={{
        paper: {
          sx: { position: overlay ? 'absolute' : 'relative' },
        },
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

/* ================================================================== *
 * The page                                                           *
 * ================================================================== */

export default function QueryLogPage() {
  const sidebar = useSidebarToggle();
  const [active, setActive] = React.useState('home');

  const [selection, setSelection] = React.useState<FilterValue>({});
  const [search, setSearch] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const activeCount = countActiveFilters(FILTER_GROUPS, selection);
  const isFiltered = activeCount > 0 || search.trim() !== '';
  const rows = filterQueries(QUERY_ROWS, search, selection);

  function clearFilters() {
    setSelection({});
    setSearch('');
  }

  /* The rail runs the full height and the bar starts where it ends, so
     the outer box is a row: rail, then a column. */
  return (
    <Stack
      {...atomsRegion('dashboard', 'shell')}
      direction="row"
      sx={{ height: '100vh' }}
    >
      {!sidebar.hidden && (
        <AppRail active={active} onActiveChange={setActive} />
      )}

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        {/* The toggle leads the bar. Per-page actions go after it. */}
        <Navbar {...atomsRegion('dashboard', 'navbar')}>
          <IconButton
            variant="secondary"
            appearance="text"
            size="sm"
            {...sidebar.toggleProps}
          >
            <SidebarSimpleIcon />
          </IconButton>
        </Navbar>

        {/* Bands: title, toolbar, grid. The first two are as tall as what
            is in them and the grid takes everything left, so the footer
            lands on the bottom edge of the screen at any height. */}
        <Stack sx={{ flex: 1, minHeight: 0 }}>
          <Box
            {...atomsRegion('dashboard', 'title')}
            sx={{ px: 3, py: 3 }}
          >
            <Typography variant="h3" component="h1">
              Query Log
            </Typography>
          </Box>
          <Divider />

          <Stack
            {...atomsRegion('dashboard', 'toolbar')}
            direction="row"
            sx={{
              px: 3,
              py: 2,
              gap: 1.5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TextField
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              startAdornment={<MagnifyingGlassIcon />}
              sx={{ width: 280 }}
            />
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button
                variant="secondary"
                appearance="outline"
                disabled={!isFiltered}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
              <Button
                variant="secondary"
                appearance="outline"
                startIcon={<FadersHorizontalIcon />}
                onClick={(event) => setAnchorEl(event.currentTarget)}
              >
                Filter
                {activeCount > 0 && (
                  <Chip
                    size="sm"
                    variant="primary"
                    component="span"
                    label={activeCount}
                  />
                )}
              </Button>
            </Stack>
          </Stack>
          <Divider />

          {/* A definite height for the grid to be 100% of. Without the
              minHeight the rows would push the column taller than the
              screen instead of scrolling inside it. */}
          <Box
            {...atomsRegion('dashboard', 'table')}
            sx={{ flex: 1, minHeight: 0 }}
          >
            <DataGrid
              size="sm"
              rows={rows}
              columns={QUERY_COLUMNS}
              rowNoun="queries"
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </Box>
        </Stack>
      </Stack>

      {/* The hidden rail, floated in under the bar while its toggle is
          hovered. No backdrop and no focus trap: the page stays live. */}
      <AppRail
        peekProps={sidebar.peekProps}
        onNavigate={sidebar.closePeek}
        active={active}
        onActiveChange={setActive}
      />

      {/* The trigger sits at the right end of the toolbar, so the panel
          hangs off its right edge — left-aligned it would run off the
          page and be pushed back in, lining up with nothing. */}
      <Filter
        {...atomsRegion('dashboard', 'filter')}
        groups={FILTER_GROUPS}
        value={selection}
        onChange={setSelection}
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </Stack>
  );
}

`;
