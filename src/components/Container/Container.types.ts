/**
 * Props for `Container` — MUI's `ContainerProps`, re-exported unchanged.
 *
 * As with `Box`, `Stack`, and `Grid`, nothing is `Omit`ted and nothing
 * is added: Container has no Neoflo API layered over it (see
 * `Container.tsx`), so narrowing the type here would only make the
 * component less capable than the thing it re-exports.
 *
 * The generic parameters come across intact:
 *
 *   ContainerProps                  // props for the default <div>
 *   ContainerProps<'main'>          // + the props of that element
 *   ContainerProps<typeof Link>     // + that component's own props
 *
 * `Breakpoint` — the union behind `maxWidth` — is deliberately not
 * re-exported. It is `'xs' | 'sm' | 'md' | 'lg' | 'xl'`, but `maxWidth`
 * also accepts `false`, so the union alone is the wrong type to
 * annotate with. Index the props type instead when forwarding a value
 * through a component of your own:
 *
 *   interface PageProps {
 *     width?: ContainerProps['maxWidth'];   // Breakpoint | false
 *   }
 *
 * One quirk of MUI's declaration, inherited rather than introduced
 * here: `ContainerProps` intersects a loose `component?: ElementType`
 * onto the resolved props, so the type permits a `component` that
 * disagrees with the generic argument. The JSX call signature on the
 * component itself is the strict one, which is what actually type-checks
 * `<Container component="main">` at the usage site.
 */
export type { ContainerProps } from '@mui/material';
