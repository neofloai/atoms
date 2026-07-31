/**
 * Props for `Box` — MUI's `BoxProps`, re-exported unchanged.
 *
 * Unlike every other component in `src/components/`, nothing is
 * `Omit`ted and nothing is added: Box has no Neoflo API layered over
 * it (see `Box.tsx`), so narrowing the type here would only make the
 * component less capable than the thing it re-exports.
 *
 * The generic parameters come across intact:
 *
 *   BoxProps                    // props for the default <div>
 *   BoxProps<'a'>               // + anchor props, so `href` is typed
 *   BoxProps<typeof Link>       // + that component's own props
 */
export type { BoxProps } from '@mui/material';
