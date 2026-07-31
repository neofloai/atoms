/**
 * Props for `Stack` — MUI's `StackProps`, re-exported unchanged.
 *
 * As with `Box`, nothing is `Omit`ted and nothing is added: Stack has no
 * Neoflo API layered over it (see `Stack.tsx`), so narrowing the type
 * here would only make the component less capable than the thing it
 * re-exports.
 *
 * The generic parameters come across intact:
 *
 *   StackProps                  // props for the default <div>
 *   StackProps<'ul'>            // + list props
 *   StackProps<typeof Link>     // + that component's own props
 */
export type { StackProps } from '@mui/material';
