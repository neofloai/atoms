/**
 * Neoflo icon entrypoint.
 *
 * Consumers of `@neoflo/atoms` get the full Phosphor icon set via this
 * subpath. The fact that we use Phosphor under the hood is an
 * implementation detail — consumers never install
 * `@phosphor-icons/react` themselves.
 *
 * @example
 * import { ShieldCheck, ArrowRight } from '@neoflo/atoms/icons';
 *
 * <ShieldCheck />          // 24px regular, currentColor (Neoflo defaults)
 * <ArrowRight size={16} /> // per-instance overrides still work
 *
 * The 6 Phosphor weights — `thin`, `light`, `regular`, `bold`, `fill`,
 * `duotone` — match the weight variants shipped in Figma.
 *
 * Defaults are applied via `IconContext.Provider` in
 * `src/theme/ThemeProvider.tsx`, so direct named imports inherit the
 * Neoflo look without any extra props.
 *
 * Tree-shakable: importing one icon ships ~1 KB; the other ~9,000
 * icons are never touched.
 */

export * from '@phosphor-icons/react';
