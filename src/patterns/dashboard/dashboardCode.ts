/**
 * The dashboard pattern, as a page a consumer can paste.
 *
 * Kept in its own file because it is one long string and the metadata
 * around it is short — and because `get_pattern` promises "the full page
 * layout code", so this is the deliverable rather than an excerpt of one.
 * The rail's contents are written out for the same reason: a snippet that
 * referenced an `<AppSidebar />` the reader does not have would hand back
 * half a screen.
 *
 * What is left to the reader is the data — the rows, the columns and the
 * facet options — because those are the application. Everything that is
 * layout is here.
 */
export const dashboardCode = `'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  DataGrid,
  Divider,
  Drawer,
  Filter,
  IconButton,
  Menu,
  MenuItem,
  Navbar,
  NeofloLogo,
  Stack,
  TextField,
  ToggleButton,
  Tooltip,
  Typography,
  countActiveFilters,
} from '@neofloai/atoms';
import {
  BagSimpleIcon,
  CaretDownIcon,
  ChartLineIcon,
  ChartLineUpIcon,
  FadersHorizontalIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  SquaresFourIcon,
} from '@neofloai/atoms/icons';
import {
  border,
  elevation,
  fontWeights,
  radius,
  surface,
  text,
} from '@neofloai/atoms/tokens';

import type { FilterValue } from '@neofloai/atoms';
import { QUERY_COLUMNS, QUERY_ROWS, filterQueries } from './queries';
import { FILTER_GROUPS } from './facets';

/**
 * The folded rail. A width the rail is in, not a rung on the scale —
 * which is why it goes to size as a number and animates on its own.
 */
const RAIL_COLLAPSED_PX = 64;

/** Gutter the rail's blocks stretch between. Expanded only. */
const RAIL_GUTTER_PX = 16;

/**
 * Nav row geometry: a 28px row around a 20px glyph, at either level.
 *
 * 28 is not a ToggleButton size — the component set draws 36 and 32 — so
 * the box comes down here while the glyph stays the md size's own 20px.
 * The children take the same pair as the parents: a second level that
 * shrank its glyphs would read as a different kind of row rather than as
 * the same row indented.
 */
const NAV_ROW_PX = 28;
const NAV_GLYPH_PX = 20;

/**
 * Where the branch rule stands, and where a second-level row starts.
 * Both are measured from the left edge of the nav block rather than of
 * the rail, so the pair survives a change to the gutter.
 *
 * The rule lands between the parent's glyph and the child's, which is
 * what makes the indent read as descent rather than as a second list.
 */
const BRANCH_RULE_PX = 16;
const BRANCH_INDENT_PX = 32;

/**
 * Gap between the rail's edge and a folded parent's flyout, so the panel
 * reads as sitting beside the rail rather than as the rail widening.
 */
const FLYOUT_OFFSET_PX = 8;

/**
 * How far past its anchor the flyout has to start.
 *
 * It is anchored to the row's right edge but has to clear the rail's, and a
 * folded row is a 28px square centred in a 64px panel — so the rail's edge
 * is half the leftover width further out, and anchoring alone leaves the
 * panel overlapping the rail by that much.
 *
 * Stepping over the remainder rather than anchoring to the rail itself,
 * because the anchor is also what gives the panel its vertical position: it
 * opens level with the row it belongs to.
 */
const FLYOUT_ANCHOR_STEP_PX =
  (RAIL_COLLAPSED_PX - NAV_ROW_PX) / 2 + FLYOUT_OFFSET_PX;

/**
 * How long a folded parent's flyout survives the pointer leaving it.
 *
 * The panel stands clear of the rail, so the pointer crosses ground that
 * belongs to neither: mouseleave fires on the row and mouseenter on the
 * panel only arrives after the gap. Nothing can be put in that gap to
 * carry the hover — the rail's paper clips on the x-axis to fold its
 * labels, and the flyout's clips to scroll a long list, so a bridge from
 * either side is cut off at the edge it needs to cross.
 *
 * A timer is what is left, and it has to be generous rather than tight: a
 * reader who pauses mid-gap should not have the panel taken away.
 */
const FLYOUT_GRACE_MS = 300;

/**
 * The nav tree. One level of nesting is the whole shape — a rail that
 * needs three is a rail that needs a different navigation model.
 */
const NAV = [
  { key: 'queries', label: 'Query log', Icon: SquaresFourIcon },
  {
    key: 'invoices',
    label: 'Invoices',
    Icon: FileTextIcon,
    children: [
      { key: 'invoices-open', label: 'Open', Icon: BagSimpleIcon },
      { key: 'invoices-posted', label: 'Posted', Icon: ChartLineIcon },
    ],
  },
  { key: 'analytics', label: 'Spend analytics', Icon: ChartLineUpIcon },
];

const FOOTER_NAV = [{ key: 'help', label: 'Help', Icon: QuestionIcon }];

/**
 * Nav row colour, which a rail has to supply for itself.
 *
 * ToggleButton's neutral selected fill is surface/layers/card 2 — which
 * is exactly what Drawer paints its paper, so on a rail the selected row
 * has no fill at all and only its ink shifts. That is no fault of the
 * toggle's: its own component set sits it on a card 1 toolbar, where
 * card 2 is the first rung that reads.
 *
 * A rail needs the default ladder instead: default-hover under the
 * pointer, default-pressed once selected, the label moving from caption
 * ink to body. The same four values the shell's own sidebar binds.
 *
 * One object per scheme, so both land in a single applyStyles('dark')
 * block rather than two that would discard each other.
 */
const navRowStyles = (theme: any) => {
  const scheme = (mode: 'light' | 'dark') => ({
    color: text.default.caption[mode],
    '&:hover': { backgroundColor: surface.default.defaultHover[mode] },
    '&.Mui-selected': {
      backgroundColor: surface.default.defaultPressed[mode],
      color: text.default.body[mode],
      '&:hover': { backgroundColor: surface.default.defaultPressed[mode] },
    },
  });

  return { ...scheme('light'), ...theme.applyStyles('dark', scheme('dark')) };
};

/**
 * The parent of the page you are on: the selected row's ink and weight,
 * and no fill.
 *
 * The fill still marks exactly one row, so this is what is left to say
 * the current screen is inside this group — which matters most when the
 * group is shut and its selected child is not on screen at all.
 */
const onBranchRow = (theme: any) => ({
  color: text.default.body.light,
  ...theme.applyStyles('dark', { color: text.default.body.dark }),
});

/**
 * The flyout is its own surface rather than a Menu in Menu's clothes.
 *
 * The design draws it at 240px on 8px corners with an 8px inset. The house
 * Menu is 16px corners on a 4px inset and takes its width from its widest
 * item, which reads as a dropdown that has wandered onto the rail rather
 * than as a branch of it. Menu still does the anchoring, the dismissal and
 * the keyboard handling; the surface is this.
 *
 * Colour and elevation stay tokenised: card 1 is the nearest rung above the
 * card 2 rail, and medium is the house token for a floating panel.
 */
const FLYOUT_WIDTH_PX = 240;

const flyoutSurface = (theme: any) => ({
  width: FLYOUT_WIDTH_PX,
  maxWidth: FLYOUT_WIDTH_PX,
  borderRadius: radius.sm + 'px',
  padding: FLYOUT_OFFSET_PX + 'px',
  boxShadow: elevation.medium,
  backgroundColor: surface.layers.card1.light,
  borderColor: border.layers.card2.light,
  ...theme.applyStyles('dark', {
    backgroundColor: surface.layers.card1.dark,
    borderColor: border.layers.card2.dark,
  }),
});

/**
 * A row inside the flyout, drawn as the rail's own row rather than as a
 * menu item: a 28px pill on 4px corners, an 8px inset, an 8px glyph gap and
 * the same colour ladder — so a child reached through the flyout and the
 * same child reached in the open rail are the same object.
 */
const flyoutRow = (theme: any) => ({
  minHeight: NAV_ROW_PX,
  height: NAV_ROW_PX,
  paddingInline: FLYOUT_OFFSET_PX + 'px',
  gap: FLYOUT_OFFSET_PX + 'px',
  borderRadius: radius.xs + 'px',
  ...navRowStyles(theme),
});

/**
 * One nav row, at either level.
 *
 * A pill the width of the block expanded, a square the height of the row
 * collapsed: the fill is the part of a row the eye reads, and a wide one
 * beside a column of icons reads as a rectangle.
 *
 * Three states rather than two. selected is the page you are on and
 * onBranch is the parent of it, which are different claims and are drawn
 * differently — one takes the fill, the other only the weight.
 */
function NavRow({
  item,
  collapsed,
  selected,
  onBranch,
  expanded,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}) {
  const { label, Icon, children } = item;
  return (
    /* A folded parent gets no tooltip: its flyout opens on the same hover
       and already carries the name as a header, so a tooltip would be the
       same word twice, in two panels, overlapping. */
    <Tooltip title={collapsed && !children ? label : ''} placement="right">
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
        aria-label={collapsed && children ? label : undefined}
        aria-expanded={children && !collapsed ? expanded : undefined}
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
          // The panel is mid-animation while this row is still laid out at
          // its old width. Pinning the glyph and refusing the wrap leaves
          // the label to be clipped by the panel, which is what should
          // absorb it.
          whiteSpace: 'nowrap',
          '& svg': { flexShrink: 0 },
          ...(onBranch && onBranchRow(theme)),
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
          // own overflow to fold the labels; the gap beyond that is what
          // the grace period is for.
          ...(collapsed &&
            children && {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '100%',
                width: (RAIL_COLLAPSED_PX - NAV_ROW_PX) / 2 + 'px',
              },
            }),
        })}
      >
        <Icon size={NAV_GLYPH_PX} />
        {!collapsed && label}
        {/* A parent's caret is its only trailing part, so it takes the
            slack rather than sitting in the label's gap. Folded, there is
            no slack and no label — the glyph is the whole row. */}
        {!collapsed && children && (
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

/**
 * A parent and the level under it.
 *
 * Expanded, the children reflow in beneath the parent behind the branch
 * rule. Folded, there is no width to indent into, so the same children
 * arrive in a flyout anchored to the parent's glyph. One level of
 * nesting, two places to put it — and the second one is why a folded
 * rail does not have to drop its nesting on the floor.
 */
function NavGroup({ item, collapsed, active, onNavigate }) {
  const onBranch = item.children.some((child) => child.key === active);
  const [expanded, setExpanded] = React.useState(onBranch);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // Arriving on the branch from anywhere else opens the group. Adjusted
  // during render rather than in an effect: it is state derived from a
  // change in active, so an effect would open the group a frame late and
  // cost a second pass. Tracking the previous value keeps it to the
  // transition — read directly, onBranch would force the group open every
  // render and a reader could never shut a group they are standing in.
  const [wasOnBranch, setWasOnBranch] = React.useState(onBranch);
  if (onBranch !== wasOnBranch) {
    setWasOnBranch(onBranch);
    if (onBranch) setExpanded(true);
  }

  /**
   * Hover, with a grace period for crossing the seam.
   *
   * Leaving the glyph and entering the flyout are two events with a gap
   * between them, so closing on mouseleave alone would shut the panel
   * before the pointer could reach it. The close is scheduled instead, and
   * the panel's own mouseenter cancels it.
   */
  const closeTimer = React.useRef(undefined);

  function holdFlyout() {
    clearTimeout(closeTimer.current);
  }

  function openFlyout(element) {
    clearTimeout(closeTimer.current);
    setAnchorEl(element);
  }

  function closeFlyout() {
    clearTimeout(closeTimer.current);
    setAnchorEl(null);
  }

  function closeFlyoutSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setAnchorEl(null), FLYOUT_GRACE_MS);
  }

  // A pending close outliving the component would call setState on it.
  React.useEffect(() => () => clearTimeout(closeTimer.current), []);

  function selectChild(key) {
    onNavigate(key);
    closeFlyout();
  }

  return (
    <>
      <NavRow
        item={item}
        collapsed={collapsed}
        selected={false}
        onBranch={onBranch}
        expanded={expanded}
        // Hover is how a folded rail reveals anything, so it is how the
        // flyout opens. Click still works, because hover is not available
        // to a touch screen or a keyboard.
        onMouseEnter={
          collapsed ? (event) => openFlyout(event.currentTarget) : undefined
        }
        onMouseLeave={collapsed ? closeFlyoutSoon : undefined}
        onSelect={(event) =>
          collapsed
            ? openFlyout(event.currentTarget)
            : setExpanded((previous) => !previous)
        }
      />

      {!collapsed && (
        <Collapse in={expanded}>
          <Stack
            sx={(theme) => ({
              gap: 1,
              ml: BRANCH_RULE_PX + 'px',
              pl: BRANCH_INDENT_PX - BRANCH_RULE_PX - 1 + 'px',
              borderLeft: '1px solid',
              // The default ladder, not layers. A layers/card 2 rule is a
              // rung off the rail's own card 2 fill and measures 1.06:1
              // against it — invisible, and a branch nobody can see is not
              // a branch. Same correction the selected row needs.
              borderColor: border.default.default.light,
              ...theme.applyStyles('dark', {
                borderColor: border.default.default.dark,
              }),
            })}
          >
            {item.children.map((child) => (
              <NavRow
                key={child.key}
                item={child}
                collapsed={false}
                selected={active === child.key}
                onSelect={() => onNavigate(child.key)}
              />
            ))}
          </Stack>
        </Collapse>
      )}

      {/* The flyout keeps the parent's name as a header. Folded, the
          trigger is a 16px glyph, and two rows hanging off it say
          nothing about which branch they belong to. */}
      <Menu
        anchorEl={anchorEl}
        // Gated on collapsed as well as the anchor, so expanding the rail
        // dismisses the flyout on its own. The alternative is an effect
        // clearing the anchor, which fires after the glyph it points at
        // has already moved.
        open={collapsed && anchorEl !== null}
        onClose={closeFlyout}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        // A hover panel must not take the pointer. The modal's backdrop
        // covers the whole viewport, so left alone it would swallow the
        // hover on every other glyph in the rail and the pointer could
        // never leave this row. The panel itself takes it back.
        sx={(theme) => ({
          pointerEvents: 'none',
          // The panel's own styles go here, not on slotProps.paper. Menu
          // paints its paper through a descendant selector, which outranks
          // the single class an sx on the paper generates — the same
          // specificity trap Drawer documents for its width. Written as the
          // same selector, so these actually land.
          '& .MuiMenu-paper': {
            pointerEvents: 'auto',
            ml: FLYOUT_ANCHOR_STEP_PX + 'px',
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
        {/* The parent's name, then a rule, then the level. The design heads
            the panel this way because the trigger is a bare glyph: without
            the name, two rows arrive from nowhere. */}
        <Box
          sx={(theme) => ({
            pb: FLYOUT_OFFSET_PX + 'px',
            mb: FLYOUT_OFFSET_PX + 'px',
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
        <Stack sx={{ gap: radius.xs + 'px' }}>
          {item.children.map(({ key, label, Icon }) => (
            <MenuItem
              key={key}
              selected={active === key}
              onClick={() => selectChild(key)}
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

/**
 * The rail: brand, the nav it takes you around by, and a footer group
 * pinned to the bottom. Four blocks separated by space rather than rules.
 */
function NavRail({ collapsed, active, onNavigate }) {
  const block = {
    px: collapsed ? 0 : RAIL_GUTTER_PX + 'px',
    alignItems: collapsed ? 'center' : 'stretch',
  };

  return (
    <Drawer
      variant="permanent"
      size={collapsed ? RAIL_COLLAPSED_PX : 'sm'}
      slotProps={{ paper: { sx: { position: 'relative', py: 2.5 } } }}
    >
      <Stack sx={{ ...block, pb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', color: 'text.primary' }}>
          <NeofloLogo variant={collapsed ? 'mark' : 'full'} size={16} />
        </Box>
      </Stack>

      {/* Takes the slack, which is what pins the footer group down. */}
      <Stack sx={{ ...block, flex: 1, minHeight: 0, gap: 1 }}>
        {NAV.map((item) =>
          item.children ? (
            <NavGroup
              key={item.key}
              item={item}
              collapsed={collapsed}
              active={active}
              onNavigate={onNavigate}
            />
          ) : (
            <NavRow
              key={item.key}
              item={item}
              collapsed={collapsed}
              selected={active === item.key}
              onSelect={() => onNavigate(item.key)}
            />
          )
        )}
      </Stack>

      <Stack sx={{ ...block, gap: 1, flexShrink: 0 }}>
        {FOOTER_NAV.map((item) => (
          <NavRow
            key={item.key}
            item={item}
            collapsed={collapsed}
            selected={active === item.key}
            onSelect={() => onNavigate(item.key)}
          />
        ))}
      </Stack>
    </Drawer>
  );
}

export default function QueryLogPage() {
  const [collapsed, setCollapsed] = React.useState(true);
  const [active, setActive] = React.useState('queries');

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
    <Stack direction="row" sx={{ height: '100vh' }}>
      <NavRail collapsed={collapsed} active={active} onNavigate={setActive} />

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        {/* The bar holds the one control whose position does not move when
            the rail folds. Per-page actions go in the space after it. */}
        <Navbar>
          <IconButton
            variant="secondary"
            appearance="text"
            size="sm"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((previous) => !previous)}
          >
            <SidebarSimpleIcon />
          </IconButton>
        </Navbar>

        {/* Bands: title, toolbar, grid. The first two are as tall as what
            is in them and the grid takes everything left, so the footer
            lands on the bottom edge of the screen at any height. */}
        <Stack sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ px: 3, py: 3 }}>
            <Typography variant="h3" component="h1">
              Query Log
            </Typography>
          </Box>
          <Divider />

          <Stack
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
          <Box sx={{ flex: 1, minHeight: 0 }}>
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

      {/* The trigger sits at the right end of the toolbar, so the panel
          hangs off its right edge — left-aligned it would run off the
          page and be pushed back in, lining up with nothing. */}
      <Filter
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
