import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  NAVBAR_HEIGHT_PX,
  NeofloLogo,
  Tooltip,
} from '@neofloai/atoms';
import type { DrawerProps, SidebarResizeHandleProps, TooltipProps } from '@neofloai/atoms';
import { Link, matchPath, useLocation } from 'react-router';

import { NAV_ITEMS } from './navigation';

const RAIL_INSET_PX = 12;
const BRAND_INSET_PX = 20;
const LOGO_PX = 16;
const NAV_GLYPH_PX = 16;

interface AppRailProps {
  /** The docked rail, from `useSidebarToggle().dockProps`. */
  dockProps?: DrawerProps;
  resizeHandleProps?: SidebarResizeHandleProps;
  resizeTooltipProps?: Omit<TooltipProps, 'children'>;
  /** The floating peek, from `useSidebarToggle().peekProps`. Takes the place of `dockProps`. */
  peekProps?: DrawerProps;
  onNavigate?: () => void;
}

/**
 * The app's sidebar: the mark, then one row per page.
 *
 * Rendered twice by the layout — docked, and as the peek that floats in
 * while the rail is hidden — so it takes whichever props it was handed.
 */
export function AppRail({
  dockProps,
  resizeHandleProps,
  resizeTooltipProps,
  peekProps,
  onNavigate,
}: AppRailProps) {
  const { pathname } = useLocation();

  const contents = (
    <>
      {!peekProps && (
        <Box
          sx={{
            height: NAVBAR_HEIGHT_PX.sm,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            px: `${BRAND_INSET_PX}px`,
            color: 'text.primary',
          }}
        >
          <NeofloLogo variant="full" size={LOGO_PX} />
        </Box>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: `${RAIL_INSET_PX}px` }}>
        <List variant="nav" component="nav" aria-label="Main">
          {NAV_ITEMS.map(({ label, path, Icon }) => {
            const selected = matchPath({ path, end: true }, pathname) !== null;
            return (
              <ListItemButton
                key={path}
                component={Link}
                to={path}
                selected={selected}
                aria-current={selected ? 'page' : undefined}
                onClick={onNavigate}
              >
                <ListItemIcon>
                  <Icon size={NAV_GLYPH_PX} />
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </>
  );

  if (peekProps) {
    return (
      <Drawer size="sm" {...peekProps}>
        {contents}
      </Drawer>
    );
  }

  return (
    <Drawer variant="permanent" size="sm" {...dockProps}>
      {contents}
      {resizeHandleProps && (
        <Tooltip title="" {...resizeTooltipProps}>
          <Box {...resizeHandleProps} />
        </Tooltip>
      )}
    </Drawer>
  );
}
