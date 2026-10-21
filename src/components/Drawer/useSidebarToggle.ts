'use client';

import * as React from 'react';
import { drawerClasses } from '@mui/material';

import { elevation, radius, spacing } from '@/src/tokens';

import { NAVBAR_HEIGHT_PX } from '../Navbar/Navbar';
import {
  DRAWER_WIDTH_PX,
  SIDEBAR_MAX_WIDTH_PX,
  SIDEBAR_MIN_WIDTH_PX,
} from './drawerMetrics';

import type { TooltipProps } from '../Tooltip';
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

/** One arrow-key press on the resize handle — `Scale/200`. */
const RESIZE_STEP_PX = spacing.component.xs;

/**
 * How far the pointer has to travel before a press on the handle is a
 * drag. Under it, the press is a click, and a click collapses the
 * sidebar — so a hand that wobbles a pixel on the way down still clicks.
 */
const DRAG_THRESHOLD_PX = 3;

/** What the handle does, said on hover: both of its gestures. */
const RESIZE_HANDLE_HINT = React.createElement(
  React.Fragment,
  null,
  'Click to collapse',
  React.createElement('br'),
  'Drag to resize'
);

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
  /**
   * The width the sidebar starts at. Held between `minWidth` and
   * `maxWidth`.
   *
   * @default 220 — `size="sm"`
   */
  defaultWidth?: number;
  /** @default SIDEBAR_MIN_WIDTH_PX (220) */
  minWidth?: number;
  /** @default SIDEBAR_MAX_WIDTH_PX (320) */
  maxWidth?: number;
}

/**
 * Props for the sidebar's resize handle — spread them on an empty element
 * inside the docked `Drawer`. The drawer places and draws it.
 */
export interface SidebarResizeHandleProps {
  'data-drawer-resize-handle': '';
  'data-resizing'?: '';
  role: 'separator';
  'aria-orientation': 'vertical';
  'aria-label': string;
  'aria-valuenow': number;
  'aria-valuemin': number;
  'aria-valuemax': number;
  tabIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}

/** Props for the sidebar toggle — spread them on its `IconButton`. */
export interface SidebarToggleProps {
  'aria-label': string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export interface UseSidebarToggleResult {
  /** The docked sidebar is closed. */
  hidden: boolean;
  setHidden: React.Dispatch<React.SetStateAction<boolean>>;
  /** The sidebar's current width, docked and peeking alike. */
  width: number;
  setWidth: (width: number) => void;
  /** Spread on the toggle in the bar. */
  toggleProps: SidebarToggleProps;
  /**
   * Spread on the docked `Drawer`: `persistent`, open while not hidden,
   * at the current width. Keep it mounted — it slides away and gives its
   * space back when the toggle hides it.
   */
  dockProps: DrawerProps;
  /** Spread on an empty element inside the docked `Drawer`. */
  resizeHandleProps: SidebarResizeHandleProps;
  /**
   * Spread on a `Tooltip` wrapping the handle: "Click to collapse / Drag
   * to resize", to its right. Controlled, so it stays shut while the
   * handle is being dragged.
   */
  resizeTooltipProps: Omit<TooltipProps, 'children'>;
  /**
   * Spread on a second `Drawer` holding the same navigation — the peek,
   * at the same width as the docked one.
   */
  peekProps: DrawerProps;
  /** Close the peek — call it when a page is picked from it. */
  closePeek: () => void;
}

/**
 * The app sidebar's toggle and its width: press to hide, hover to peek,
 * drag the edge to resize.
 *
 * Pressed, the toggle closes the docked sidebar the way MUI's persistent
 * drawer closes — the panel slides out and the bar and the page reflow
 * into its space — and pressing it again slides it back. While it is
 * hidden, hovering the toggle floats the same navigation in under the
 * bar: a `temporary` drawer on 12px corners with a border all round and a
 * shadow, 8px in from the edge. It leaves when the pointer does, after a
 * short grace that lets the pointer cross from the toggle to the panel,
 * or as soon as a page is picked.
 *
 * The peek is a look, not a mode. It has no backdrop and no focus trap,
 * and the pointer passes through everywhere but the panel, so the page
 * under it stays live.
 *
 * Docked, the sidebar's trailing edge is a handle with two gestures:
 * click it to collapse the sidebar, as the toggle does, or drag it to
 * resize between 220 and 320px. Hovered, it shows a grip and a tooltip
 * naming both. The arrow keys step the width, and Enter collapses. The
 * width is the peek's too, so the sidebar floats in at the size it was
 * docked at.
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
 *   <Drawer {...sidebar.dockProps}>
 *     <AppNav />
 *     <Tooltip {...sidebar.resizeTooltipProps}>
 *       <Box {...sidebar.resizeHandleProps} />
 *     </Tooltip>
 *   </Drawer>
 *   <Stack sx={{ flex: 1, minWidth: 0 }}>
 *     <Navbar>
 *       <IconButton variant="secondary" appearance="text" size="sm" {...sidebar.toggleProps}>
 *         <SidebarSimpleIcon />
 *       </IconButton>
 *     </Navbar>
 *     {children}
 *   </Stack>
 *   <Drawer {...sidebar.peekProps}>
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
  minWidth = SIDEBAR_MIN_WIDTH_PX,
  maxWidth = SIDEBAR_MAX_WIDTH_PX,
  defaultWidth = DRAWER_WIDTH_PX.sm,
}: UseSidebarToggleOptions = {}): UseSidebarToggleResult {
  const [hidden, setHidden] = React.useState(defaultHidden);
  const [peeking, setPeeking] = React.useState(false);

  const clamp = React.useCallback(
    (value: number) => Math.min(maxWidth, Math.max(minWidth, value)),
    [minWidth, maxWidth]
  );
  const [width, setRawWidth] = React.useState(() => clamp(defaultWidth));
  const setWidth = React.useCallback(
    (value: number) => setRawWidth(clamp(Math.round(value))),
    [clamp]
  );

  // Where the press started: the pointer's x and the width under it. The
  // drag is relative to that, so grabbing the handle a few pixels off its
  // centre does not make the panel jump to the pointer. `moved` is what
  // tells a drag from a click when the pointer comes up.
  const drag = React.useRef<{
    x: number;
    width: number;
    moved: boolean;
  } | null>(null);
  const [resizing, setResizing] = React.useState(false);
  const [hinting, setHinting] = React.useState(false);

  // While the drag lasts the whole page shows the resize cursor and
  // selects nothing, or text lights up wherever the pointer passes.
  React.useEffect(() => {
    if (!resizing) return undefined;
    const { style } = document.body;
    const previous = { cursor: style.cursor, userSelect: style.userSelect };
    style.cursor = 'col-resize';
    style.userSelect = 'none';
    return () => {
      style.cursor = previous.cursor;
      style.userSelect = previous.userSelect;
    };
  }, [resizing]);

  const endPress = (event: React.PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const clicked = event.type === 'pointerup' && !drag.current.moved;
    drag.current = null;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (clicked) {
      setHinting(false);
      setHidden(true);
    }
  };

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

  const dockProps: DrawerProps = {
    variant: 'persistent',
    open: !hidden,
    size: width,
    // A transition would trail the pointer by a frame and the edge would
    // feel loose, so it is off while the handle is held.
    disableSizeTransition: resizing,
  };

  const resizeHandleProps: SidebarResizeHandleProps = {
    'data-drawer-resize-handle': '',
    ...(resizing && { 'data-resizing': '' as const }),
    role: 'separator',
    'aria-orientation': 'vertical',
    'aria-label': 'Resize sidebar',
    'aria-valuenow': width,
    'aria-valuemin': minWidth,
    'aria-valuemax': maxWidth,
    tabIndex: 0,
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { x: event.clientX, width, moved: false };
    },
    onPointerMove: (event) => {
      const press = drag.current;
      if (!press) return;
      const travel = event.clientX - press.x;
      if (!press.moved) {
        if (Math.abs(travel) < DRAG_THRESHOLD_PX) return;
        press.moved = true;
        setResizing(true);
      }
      setWidth(press.width + travel);
    },
    onPointerUp: endPress,
    onPointerCancel: endPress,
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setHidden(true);
        return;
      }
      const next = {
        ArrowLeft: width - RESIZE_STEP_PX,
        ArrowRight: width + RESIZE_STEP_PX,
        Home: minWidth,
        End: maxWidth,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      setWidth(next);
    },
  };

  const resizeTooltipProps: Omit<TooltipProps, 'children'> = {
    title: RESIZE_HANDLE_HINT,
    placement: 'right',
    open: hinting && !resizing && !hidden,
    onOpen: () => setHinting(true),
    onClose: () => setHinting(false),
  };

  const peekProps: DrawerProps = {
    variant: 'temporary',
    size: width,
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

  return {
    hidden,
    setHidden,
    width,
    setWidth,
    toggleProps,
    dockProps,
    resizeHandleProps,
    resizeTooltipProps,
    peekProps,
    closePeek,
  };
}
