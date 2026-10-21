'use client';

import * as React from 'react';

import { FLYOUT_GRACE_MS } from './AppRail';

/** What the sidebar toggle needs: its name, its press and its hover. */
export interface RailToggleProps {
  'aria-label': string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * The main shell's sidebar behaviour, shared by the shell demo and every
 * pattern built on it.
 *
 * The toggle hides the docked rail outright, and the page takes the width
 * back. While it is hidden, hovering the toggle floats the rail in under
 * the bar — `RailPeek` — without docking it. It leaves when the pointer
 * does, after the same grace a folded parent's flyout gets, which is what
 * lets the pointer cross from the toggle down to the panel. Picking a page
 * closes it; pressing the toggle docks the rail again.
 *
 * Returns the state and two things to spread: `toggleProps` on the
 * toggle, and `peekProps` on a `RailPeek` laid over the column the bar
 * heads.
 */
export function useRailPeek(initiallyHidden = false) {
  const [hidden, setHidden] = React.useState(initiallyHidden);
  const [peeking, setPeeking] = React.useState(false);

  /**
   * The close is scheduled on `mouseleave`, and the panel's own
   * `mouseenter` cancels it.
   */
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = React.useCallback(() => {
    clearTimeout(timer.current);
    setPeeking(true);
  }, []);

  const hold = React.useCallback(() => {
    clearTimeout(timer.current);
  }, []);

  const close = React.useCallback(() => {
    clearTimeout(timer.current);
    setPeeking(false);
  }, []);

  const closeSoon = React.useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPeeking(false), FLYOUT_GRACE_MS);
  }, []);

  // A pending close outliving the component would call setState on it.
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const toggleProps: RailToggleProps = {
    'aria-label': hidden ? 'Show sidebar' : 'Hide sidebar',
    onClick: () => {
      setHidden((previous) => !previous);
      close();
    },
    // Hover only means something while there is a rail to peek at.
    onMouseEnter: hidden ? show : undefined,
    onMouseLeave: hidden ? closeSoon : undefined,
  };

  return {
    hidden,
    toggleProps,
    peekProps: {
      open: hidden && peeking,
      onClose: close,
      onNavigate: close,
      onMouseEnter: hold,
      onMouseLeave: closeSoon,
    },
  };
}
