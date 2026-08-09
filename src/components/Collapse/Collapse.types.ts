/**
 * Props for `Collapse` — MUI's `CollapseProps`, re-exported unchanged.
 *
 * The shared transition surface described in
 * `src/components/Fade/Fade.types.ts`, plus the props that come from
 * `Collapse` rendering real DOM rather than only cloning its child:
 *
 *   orientation   // 'vertical' | 'horizontal' — default 'vertical'
 *   collapsedSize // size when closed — default '0px'
 *   timeout       // additionally accepts 'auto'
 *   component     // element rendered at the root
 *   sx / classes / slots / slotProps
 *
 * `children` is a plain `ReactNode` here, not the single ref-holding
 * element the other four transitions require — `Collapse` wraps its
 * content instead of cloning it, so text, fragments, and lists are all
 * valid children.
 */
export type { CollapseProps } from '@mui/material';

/**
 * Axis a `Collapse` animates along.
 *
 * Derived from MUI's own union rather than redeclared, so it cannot
 * drift.
 */
export type CollapseOrientation = NonNullable<
  import('@mui/material').CollapseProps['orientation']
>;
