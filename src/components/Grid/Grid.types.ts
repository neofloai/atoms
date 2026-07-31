/**
 * Props for `Grid` — MUI's `GridProps`, re-exported unchanged.
 *
 * As with `Box` and `Stack`, nothing is `Omit`ted and nothing is added:
 * Grid has no Neoflo API layered over it (see `Grid.tsx`), so narrowing
 * the type here would only make the component less capable than the
 * thing it re-exports.
 *
 * The generic parameters come across intact:
 *
 *   GridProps                   // props for the default <div>
 *   GridProps<'ul'>             // + list props
 *   GridProps<typeof Link>      // + that component's own props
 *
 * MUI's supporting unions (`GridSize`, `GridOffset`, `GridDirection`,
 * `GridSpacing`, `GridWrap`) are deliberately not re-exported. They only
 * describe the scalar half of each prop — the responsive forms wrap them
 * in an internal `ResponsiveStyleValue`, which is not part of MUI's
 * public surface — so indexing the props type is both shorter and more
 * accurate for forwarding a value through a component of your own:
 *
 *   interface CardGridProps {
 *     size?: GridProps['size'];      // number | 'auto' | 'grow' | false
 *   }                                // …and every responsive form of it
 */
export type { GridProps } from '@mui/material';
