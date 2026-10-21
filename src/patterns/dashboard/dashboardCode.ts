/**
 * The dashboard pattern, as a page a consumer can paste.
 *
 * Kept in its own file because it is one long string and the metadata
 * around it is short — and because `get_pattern` promises "the full page
 * layout code", so this is the deliverable rather than an excerpt of one.
 *
 * It also carries the app's rail in full — sections, a second level, the
 * workspace switcher, the folded strip, the floating rail and the hidden
 * rail's peek — because every other pattern imports that rail from
 * `./AppRail` rather than redrawing it, and this is where it is written
 * out. A snippet that referenced a rail the reader does not have would
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

import type { AvatarColor, FilterValue } from '@neofloai/atoms';
import type { ModeToken } from '@neofloai/atoms/tokens';
import { QUERY_COLUMNS, QUERY_ROWS, filterQueries } from './queries';
import { FILTER_GROUPS } from './facets';

/* ================================================================== *
 * The rail                                                           *
 *                                                                    *
 * Everything from here to "The page" is the app's sidebar. Move it   *
 * into ./AppRail.tsx and export AppRail, RailPeek, useRailPeek,      *
 * WORKFLOW_NAV and WORKFLOW_SECONDARY_NAV: the other patterns import *
 * those from there rather than redrawing the rail.                   *
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
 * Nav row geometry, the same at both levels: a 28px row, an 8px inline
 * inset, a 16px glyph, and 12px from the glyph to the label.
 */
const NAV_ROW_PX = 28;
const NAV_ROW_INSET_PX = 8;
const NAV_GLYPH_PX = 16;
const NAV_GLYPH_GAP_PX = 12;
const NAV_CARET_PX = 14;

/** Between rows, between sections, and under a section's label. */
const NAV_ROW_GAP_PX = 4;
const NAV_SECTION_GAP_PX = 16;
const NAV_LABEL_GAP_PX = 8;

/**
 * The second level: the branch rule stands under the parent's glyph, and
 * a child row starts 40px in — both from the nav block's left edge.
 */
const BRANCH_RULE_PX = 16;
const BRANCH_INDENT_PX = 40;

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
 * How long a hover panel survives the pointer leaving it — a folded
 * parent's flyout, or the hidden rail's peek. Both stand clear of what
 * opened them, so the pointer crosses a gap that belongs to neither, and
 * a timer is what carries it across.
 */
const HOVER_GRACE_MS = 300;

/** The brand mark's height; the wordmark scales from it. */
const LOGO_MARK_PX = 16;

/** The floating rail's inset from the region it floats over. */
const FLOAT_INSET_PX = 8;

/**
 * The selected row's fill. One rung further up in dark mode, where the
 * light rung is the rail's own surface and would vanish.
 */
const SELECTED_FILL: ModeToken = {
  light: surface.default.defaultHover.light,
  dark: surface.default.defaultPressed.dark,
};

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
 * rail's rows are built on, since no Atoms component draws a nav row.
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

/**
 * A nav row. At rest the label is \`text/default/b2\` and the glyph
 * \`icon/default/b2\`, at Regular. Selected, the row takes the selected
 * fill behind \`b1\` ink at Medium. Hover and keyboard focus take \`card 3\`,
 * one layer above the rail.
 *
 * State rides attributes: \`aria-current="page"\` is the page you are on,
 * and \`data-on-branch\` is the parent of a current page that is out of
 * sight — its ink and weight, with no fill.
 */
function navRowStyles(theme: Theme): Styles {
  return {
    ...BUTTON_RESET,
    ...B1_TYPE,
    height: NAV_ROW_PX,
    minWidth: 0,
    borderRadius: \`\${radius.xs}px\`,
    fontWeight: fontWeights.regular,
    textAlign: 'left',
    // Refuse the wrap and pin the glyph, so a row mid-animation clips its
    // label rather than squeezing the icon or breaking onto two lines.
    whiteSpace: 'nowrap',
    '& svg': { flexShrink: 0 },
    '&[aria-current="page"], &[data-on-branch]': {
      fontWeight: fontWeights.medium,
    },
    ...bothSchemes(theme, (mode) => ({
      color: text.default.b2[mode],
      '& svg': { color: icon.default.b2[mode] },
      '&:hover, &:focus-visible': {
        backgroundColor: surface.layers.card3[mode],
      },
      '&[data-on-branch], &[aria-current="page"]': {
        color: text.default.b1[mode],
        '& svg': { color: icon.default.b1[mode] },
      },
      '&[aria-current="page"]': {
        backgroundColor: SELECTED_FILL[mode],
      },
    })),
  };
}

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
 * One nav row: the width of the block expanded, a 28px square folded.
 * A folded leaf is named by its tooltip; a folded parent by its flyout.
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
  onBranch?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: () => void;
}) {
  return (
    <Tooltip title={collapsed && !hasChildren ? label : ''} placement="right">
      <Box
        component="button"
        type="button"
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-current={selected ? 'page' : undefined}
        data-on-branch={onBranch || undefined}
        aria-label={collapsed && hasChildren ? label : undefined}
        aria-expanded={hasChildren && !collapsed ? expanded : undefined}
        sx={(theme) => ({
          ...navRowStyles(theme),
          width: collapsed ? NAV_ROW_PX : '100%',
          alignSelf: collapsed ? 'center' : 'stretch',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 0 : \`\${NAV_ROW_INSET_PX}px\`,
          gap: \`\${NAV_GLYPH_GAP_PX}px\`,
          // A folded parent's hover target runs on to the rail's edge, so
          // the pointer is not "leaving" while it crosses the bare rail
          // towards the flyout.
          ...(collapsed &&
            hasChildren && {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '100%',
                width: \`\${(RAIL_COLLAPSED_PX - NAV_ROW_PX) / 2}px\`,
              },
            }),
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
        {!collapsed && hasChildren && (
          <Box component="span" sx={{ ml: 'auto', display: 'flex' }}>
            <Caret open={expanded} size={NAV_CARET_PX} />
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}

/**
 * A parent row and the level under it. Expanded, the children indent in
 * behind a branch rule; folded, they arrive in a flyout beside the glyph,
 * headed with the parent's name.
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

  // Arriving on the branch opens the group; a reader can still shut a
  // group they are standing inside.
  const [wasOnBranch, setWasOnBranch] = React.useState(onBranch);
  if (onBranch !== wasOnBranch) {
    setWasOnBranch(onBranch);
    if (onBranch) setExpanded(true);
  }

  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const holdFlyout = () => clearTimeout(closeTimer.current);
  const openFlyout = (element: HTMLElement) => {
    clearTimeout(closeTimer.current);
    setAnchorEl(element);
  };
  const closeFlyout = () => {
    clearTimeout(closeTimer.current);
    setAnchorEl(null);
  };
  const closeFlyoutSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setAnchorEl(null), HOVER_GRACE_MS);
  };
  React.useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <Stack sx={{ alignItems: collapsed ? 'center' : 'stretch' }}>
      <NavRow
        label={item.label}
        Icon={item.Icon}
        collapsed={collapsed}
        selected={false}
        onBranch={onBranch && (collapsed || !expanded)}
        hasChildren
        expanded={expanded}
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
              position: 'relative',
              gap: \`\${NAV_ROW_GAP_PX}px\`,
              pt: \`\${NAV_ROW_GAP_PX}px\`,
              pl: \`\${BRANCH_INDENT_PX}px\`,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: \`\${BRANCH_RULE_PX}px\`,
                top: \`\${NAV_ROW_GAP_PX}px\`,
                bottom: 0,
                borderLeft: '1px solid',
                ...ink('borderColor', border.default.default)(theme),
              },
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
        open={collapsed && Boolean(anchorEl)}
        onClose={closeFlyout}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        // A hover panel must not take the pointer off the rest of the rail.
        sx={{
          pointerEvents: 'none',
          '& .MuiMenu-paper': {
            pointerEvents: 'auto',
            ml: \`\${FLYOUT_ANCHOR_STEP_PX}px\`,
            width: FLYOUT_WIDTH_PX,
          },
        }}
        disableAutoFocusItem
        disableRestoreFocus
        slotProps={{
          paper: { onMouseEnter: holdFlyout, onMouseLeave: closeFlyoutSoon },
        }}
      >
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
    </Stack>
  );
}

/** Rows, as leaves or groups, in a column 4px apart. */
function NavItems({
  items,
  collapsed,
  active,
  onSelect,
}: {
  items: readonly RailItem[];
  collapsed: boolean;
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <Stack
      sx={{
        gap: \`\${NAV_ROW_GAP_PX}px\`,
        alignItems: collapsed ? 'center' : 'stretch',
      }}
    >
      {items.map((item) =>
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
      )}
    </Stack>
  );
}

/**
 * A section: its rows under a mono label that folds them away. Folded,
 * the label goes and the rows stay out.
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
  const rows = (
    <NavItems
      items={section.items}
      collapsed={collapsed}
      active={active}
      onSelect={onSelect}
    />
  );

  if (!section.label || collapsed) return rows;

  return (
    <Stack>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        sx={(theme) => ({
          ...BUTTON_RESET,
          alignSelf: 'stretch',
          gap: \`\${NAV_ROW_GAP_PX}px\`,
          px: \`\${NAV_ROW_INSET_PX}px\`,
          py: \`\${NAV_ROW_GAP_PX}px\`,
          borderRadius: \`\${radius.xs}px\`,
          fontFamily: fontFamilies.product.mono,
          fontSize: typography.body.b2.size,
          fontWeight: fontWeights.medium,
          lineHeight: \`\${typography.body.b2.leading}px\`,
          ...bothSchemes(theme, (mode) => ({
            color: text.default.b3[mode],
            '&:hover, &:focus-visible': {
              backgroundColor: surface.layers.card3[mode],
            },
          })),
        })}
      >
        {section.label}
        <Caret open={open} size={NAV_CARET_PX} />
      </Box>
      <Collapse in={open}>
        <Box sx={{ pt: \`\${NAV_LABEL_GAP_PX}px\` }}>{rows}</Box>
      </Collapse>
    </Stack>
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
   * An overlay summoned by hover rather than a press: no backdrop, no
   * focus trap, and the pointer passes through everywhere but the panel.
   */
  peek?: boolean;
  open?: boolean;
  onClose?: () => void;
  /** Fired when a row is picked. An overlay passes its own close. */
  onNavigate?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
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
  peek = false,
  open = false,
  onClose,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
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
  const brand = showBrand && !overlay;

  return (
    <Drawer
      variant={overlay ? 'temporary' : 'permanent'}
      open={overlay ? open : undefined}
      onClose={overlay ? onClose : undefined}
      size={collapsed ? RAIL_COLLAPSED_PX : 'sm'}
      hideBackdrop={peek}
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
          sx: {
            position: overlay ? 'absolute' : 'relative',
            ...(peek && { pointerEvents: 'auto' }),
          },
          ...(peek && { onMouseEnter, onMouseLeave }),
        },
        ...(overlay && {
          root: {
            ...(container && { container }),
            ...(peek && {
              disableAutoFocus: true,
              disableEnforceFocus: true,
              disableRestoreFocus: true,
            }),
            sx: {
              ...(container && { position: 'absolute' }),
              ...(peek && { pointerEvents: 'none' }),
            },
          },
        }),
        ...(overlay &&
          container && { backdrop: { sx: { position: 'absolute' } } }),
      }}
    >
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
          <NavItems
            items={secondaryNav}
            collapsed={collapsed}
            active={active}
            onSelect={select}
          />
        </Box>
      )}

      {showWorkspace && <WorkspaceSwitcher collapsed={collapsed} />}
    </Drawer>
  );
}

/**
 * Where a hidden rail peeks: a layer over the column the bar heads,
 * starting under the bar. The column needs \`position: relative\`. The
 * layer takes no pointer, so the page under it stays live.
 */
function RailPeek(
  props: Omit<AppRailProps, 'overlay' | 'peek' | 'container'>
) {
  const [region, setRegion] = React.useState<HTMLDivElement | null>(null);

  return (
    <Box
      ref={setRegion}
      sx={{
        position: 'absolute',
        top: NAVBAR_HEIGHT_PX.sm,
        right: 0,
        bottom: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    >
      <AppRail {...props} overlay peek container={region} />
    </Box>
  );
}

/**
 * The sidebar toggle's behaviour. Pressed, it hides the rail outright and
 * the page takes the width back. While the rail is hidden, hovering the
 * toggle floats it in under the bar without docking it; it leaves when
 * the pointer does, or when a page is picked.
 *
 * Spread \`toggleProps\` on the toggle and \`peekProps\` on a \`RailPeek\`.
 */
function useRailPeek(initiallyHidden = false) {
  const [hidden, setHidden] = React.useState(initiallyHidden);
  const [peeking, setPeeking] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    clearTimeout(timer.current);
    setPeeking(true);
  };
  const hold = () => clearTimeout(timer.current);
  const close = () => {
    clearTimeout(timer.current);
    setPeeking(false);
  };
  const closeSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPeeking(false), HOVER_GRACE_MS);
  };
  React.useEffect(() => () => clearTimeout(timer.current), []);

  return {
    hidden,
    toggleProps: {
      'aria-label': hidden ? 'Show sidebar' : 'Hide sidebar',
      onClick: () => {
        setHidden((previous) => !previous);
        close();
      },
      // Hover only means something while there is a rail to peek at.
      onMouseEnter: hidden ? show : undefined,
      onMouseLeave: hidden ? closeSoon : undefined,
    },
    peekProps: {
      open: hidden && peeking,
      onClose: close,
      onNavigate: close,
      onMouseEnter: hold,
      onMouseLeave: closeSoon,
    },
  };
}

/* ================================================================== *
 * The page                                                           *
 * ================================================================== */

export default function QueryLogPage() {
  const rail = useRailPeek();
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
      {!rail.hidden && <AppRail active={active} onActiveChange={setActive} />}

      {/* relative, so the peek's layer can sit under the bar. */}
      <Stack sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
        {/* The toggle leads the bar. Per-page actions go after it. */}
        <Navbar {...atomsRegion('dashboard', 'navbar')}>
          <IconButton
            variant="secondary"
            appearance="text"
            size="sm"
            {...rail.toggleProps}
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

        {/* The hidden rail, floated in under the bar by hovering the
            toggle. No backdrop and no focus trap: the page stays live. */}
        <RailPeek
          {...rail.peekProps}
          active={active}
          onActiveChange={setActive}
        />
      </Stack>

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
