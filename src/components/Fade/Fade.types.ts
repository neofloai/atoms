/**
 * Props for `Fade` — MUI's `FadeProps`, re-exported unchanged.
 *
 * Nothing is `Omit`ted and nothing is added. `Fade` has no Neoflo API
 * layered over it (see `Fade.tsx`), so narrowing the type here would
 * only make the component less capable than the thing it re-exports.
 *
 * The props worth knowing:
 *
 *   in                          // false → hidden, true → visible
 *   timeout                     // ms, or { enter, exit }
 *   easing                      // CSS timing function, or { enter, exit }
 *   appear                      // animate on first mount (default true)
 *   mountOnEnter / unmountOnExit
 *   disablePrefersReducedMotion // ignore the OS reduced-motion setting
 *   onEnter / onEntered / onExit / onExited
 */
export type { FadeProps } from '@mui/material';

/**
 * The prop surface every transition in this set shares — `in`,
 * `timeout`, `easing`, `mountOnEnter`, `unmountOnExit`,
 * `disablePrefersReducedMotion`, and the six lifecycle handlers.
 *
 * Exported once from here, rather than five times, for consumers
 * writing a component that accepts "any Atoms transition" and forwards
 * whatever it is given.
 *
 * @example A component that takes a transition and its props
 * interface RevealProps {
 *   transition?: React.ElementType;
 *   transitionProps?: TransitionProps;
 * }
 */
export type { TransitionProps } from '@mui/material/transitions';
