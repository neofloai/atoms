'use client';

import * as React from 'react';
import { drawerClasses } from '@mui/material';

import { elevation, radius, spacing } from '@/src/tokens';

import { NAVBAR_HEIGHT_PX } from '../Navbar/Navbar';

import type { DrawerProps } from './Drawer.types';

/**
 * How long the peek survives the pointer leaving the toggle or the panel.
 *
 * The panel floats clear of the toggle — under the bar, 8px in — so the
 * pointer crosses ground that belongs to neither on its way down. A timer
 * carries it across: long enough for a deliberate move, short enough that
 * the panel does not hang about once the pointer has gone.
 */
export const SIDEBAR_PEEK_GRACE_MS = 300;

/** The floating panel's inset from the region it floats in — `Scale/200`. */
const PEEK_INSET_PX = spacing.component.xs;

export interface UseSidebarToggleOptions {
  /**
   * Start with the sidebar hidden.
   *
   * @default false
   */
  defaultHidden?: boolean;
  /**
   * How far below the top of the screen — or of `container` — the peek
   * starts: the height of the bar it hangs under.
   *
   * @default NAVBAR_HEIGHT_PX.sm
   */
  offsetTop?: number;
  /**
   * Render the peek inside this element rather than over the whole
   * window — a preview box, a panel. The element needs
   * `position: relative`.
   */
  container?: HTMLElement | null;
}

/** Props for the sidebar toggle — spread them on its `IconButton`. */
export interface SidebarToggleProps {
  'aria-label': string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export interface UseSidebarToggleResult {
  /** The docked sidebar is off the screen. Render it only while false. */
  hidden: boolean;
  setHidden: React.Dispatch<React.SetStateAction<boolean>>;
  /** Spread on the toggle in the bar. */
  toggleProps: SidebarToggleProps;
  /**
   * Spread on a second `Drawer` holding the same navigation — the peek.
   * Add `size` as the docked one has it.
   */
  peekProps: DrawerProps;
  /** Close the peek — call it when a page is picked from it. */
  closePeek: () => void;
}

/**
 * The app sidebar's toggle: press to hide, hover to peek.
 *
 * Pressed, the toggle hides the docked sidebar outright — unmount it, and
 * the bar and the page take the full width. While it is hidden, hovering
 * the toggle floats the same navigation in under the bar: a `temporary`
 * drawer on 12px corners with a border all round and a shadow, 8px in
 * from the edge. It leaves when the pointer does, after a short grace
 * that lets the pointer cross from the toggle to the panel, or as soon as
 * a page is picked. Pressing the toggle docks the sidebar again.
 *
 * The peek is a look, not a mode. It has no backdrop and no focus trap,
 * and the pointer passes through everywhere but the panel, so the page
 * under it stays live.
 *
 * It is a hook rather than a component because the behaviour spans three
 * things a page already composes — the docked `Drawer`, the toggle in the
 * `Navbar`, and the drawer that peeks — and it returns MUI's own props for
 * each, so none of them changes.
 *
 * @example
 * const sidebar = useSidebarToggle();
 *
 * <Stack direction="row" sx={{ height: '100vh' }}>
 *   {!sidebar.hidden && (
 *     <Drawer variant="permanent" size="sm">
 *       <AppNav />
 *     </Drawer>
 *   )}
 *   <Stack sx={{ flex: 1, minWidth: 0 }}>
 *     <Navbar>
 *       <IconButton variant="secondary" appearance="text" size="sm" {...sidebar.toggleProps}>
 *         <SidebarSimpleIcon />
 *       </IconButton>
 *     </Navbar>
 *     {children}
 *   </Stack>
 *   <Drawer {...sidebar.peekProps} size="sm">
 *     <AppNav onNavigate={sidebar.closePeek} />
 *   </Drawer>
 * </Stack>
 *
 * @see Related: Drawer, Navbar, List
 */
export function useSidebarToggle({
  defaultHidden = false,
  offsetTop = NAVBAR_HEIGHT_PX.sm,
  container,
}: UseSidebarToggleOptions = {}): UseSidebarToggleResult {
  const [hidden, setHidden] = React.useState(defaultHidden);
  const [peeking, setPeeking] = React.useState(false);

  // The close is scheduled on `mouseleave`, and the panel's own
  // `mouseenter` cancels it.
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const showPeek = React.useCallback(() => {
    clearTimeout(timer.current);
    setPeeking(true);
  }, []);

  const holdPeek = React.useCallback(() => {
    clearTimeout(timer.current);
  }, []);

  const closePeek = React.useCallback(() => {
    clearTimeout(timer.current);
    setPeeking(false);
  }, []);

  const closePeekSoon = React.useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPeeking(false), SIDEBAR_PEEK_GRACE_MS);
  }, []);

  // A pending close outliving the component would call setState on it.
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const toggleProps: SidebarToggleProps = {
    'aria-label': hidden ? 'Show sidebar' : 'Hide sidebar',
    onClick: () => {
      setHidden((previous) => !previous);
      closePeek();
    },
    // Hover only means something while there is a sidebar to peek at.
    onMouseEnter: hidden ? showPeek : undefined,
    onMouseLeave: hidden ? closePeekSoon : undefined,
  };

  const peekProps: DrawerProps = {
    variant: 'temporary',
    open: hidden && peeking,
    onClose: closePeek,
    hideBackdrop: true,
    // The modal's root covers the region under the bar and lets the
    // pointer through; the panel takes it back. Written through the
    // drawer's own paper selector, which outranks the edge and corners
    // `Drawer` draws for a docked panel.
    sx: {
      top: offsetTop,
      pointerEvents: 'none',
      ...(container && { position: 'absolute' }),
      [`& .${drawerClasses.paper}`]: {
        position: 'absolute',
        pointerEvents: 'auto',
        margin: `${PEEK_INSET_PX}px`,
        height: `calc(100% - ${PEEK_INSET_PX * 2}px)`,
        borderWidth: 1,
        borderRadius: `${radius.md}px`,
        boxShadow: elevation.large,
      },
    },
    slotProps: {
      root: {
        ...(container && { container }),
        // Not something the reader committed to opening, so it neither
        // takes focus nor holds it.
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true,
      },
      paper: {
        onMouseEnter: holdPeek,
        onMouseLeave: closePeekSoon,
      },
    },
  };

  return { hidden, setHidden, toggleProps, peekProps, closePeek };
}
