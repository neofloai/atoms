/**
 * Neoflo icon entrypoint.
 *
 * Consumers of `@neofloai/atoms` get the full Phosphor icon set via this
 * subpath. The fact that we use Phosphor under the hood is an
 * implementation detail — consumers never install
 * `@phosphor-icons/react` themselves.
 *
 * @example
 * import { ShieldCheckIcon, ArrowRightIcon } from '@neofloai/atoms/icons';
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
 * Tree-shakable, and this subpath genuinely is: importing one icon ships
 * ~3 KB minified and each additional one costs about the same, while the
 * other 1,511 are never touched. Measured against `dist/icons.mjs`,
 * which compiles to a real `export * from` because this is a build entry
 * rather than a bundled dependency.
 *
 * A component *inside* the library must not import from here — see
 * `src/icons/glyphs.ts`. The same star, bundled into an entry rather than
 * being one, becomes a runtime namespace object that pins all 1,512
 * icons in every consumer.
 */

export * from '@phosphor-icons/react';
