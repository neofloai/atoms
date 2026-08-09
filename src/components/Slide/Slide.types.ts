/**
 * Props for `Slide` — MUI's `SlideProps`, re-exported unchanged.
 *
 * The shared transition surface described in
 * `src/components/Fade/Fade.types.ts`, plus two of its own:
 *
 *   direction   // 'left' | 'right' | 'up' | 'down' — where the child
 *               // enters *from*. Default 'down'.
 *   container   // element (or a function returning one) whose edges
 *               // the offset is measured against, instead of the
 *               // window's. See `Slide.tsx`.
 */
export type { SlideProps } from '@mui/material';

/**
 * Direction a `Slide` enters from.
 *
 * Derived from MUI's own union rather than redeclared, so it cannot
 * drift. Exported for consumers typing a component that takes a
 * direction and forwards it.
 */
export type SlideDirection = NonNullable<
  import('@mui/material').SlideProps['direction']
>;
