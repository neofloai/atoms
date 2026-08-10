/**
 * Neoflo icon entrypoint.
 *
 * Consumers of `@neoflo/atoms` get the full Phosphor icon set via this
 * subpath. The fact that we use Phosphor under the hood is an
 * implementation detail — consumers never install
 * `@phosphor-icons/react` themselves.
 *
 * @example
 * import { ShieldCheckIcon, ArrowRightIcon } from '@neoflo/atoms/icons';
 *
 * <ShieldCheckIcon />          // 24px regular, currentColor (Neoflo defaults)
 * <ArrowRightIcon size={16} /> // per-instance overrides still work
 *
 * Every export ends in `Icon`. Phosphor 2.1 added the suffix and
 * deprecated the bare names — `ShieldCheck` still resolves, but it is
 * flagged in editors and will go away, so write the suffixed name.
 * phosphoricons.com lists icons unsuffixed: add `Icon` to what you find
 * there.
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
