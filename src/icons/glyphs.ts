/**
 * The glyphs the library's own components render, named one by one.
 *
 * This file exists for exactly one reason: **`export *` from an external
 * package is not tree-shakable through a bundle.** Nothing else about it
 * is a preference, so read the mechanism before changing it.
 *
 * `@phosphor-icons/react` is `external` in `tsup.config.ts`, so esbuild
 * cannot see which names `src/icons/index.ts`'s star re-export provides.
 * Faced with a star from a module it cannot read, it stops emitting
 * static imports and builds a runtime namespace object instead:
 *
 *   import * as react_star from '@phosphor-icons/react';
 *   var icons_exports = {};
 *   __reExport(icons_exports, react_star);
 *   ...
 *   jsx(icons_exports.CaretDownIcon, {})     // a property lookup
 *
 * A property lookup off a namespace object is not a resolvable reference.
 * The consumer's bundler — Vite, webpack, Next, all of them — cannot
 * prove which properties are read, so it has to keep the whole barrel.
 * That is all 1,512 icons — 3,045 exported components, counting the
 * deprecated bare aliases Phosphor still ships beside the `*Icon` names —
 * retained by an app that imported `Button` and no icon at all. Measured
 * on exactly that bundle: 6,265 KB with the leak, 1,180 KB without, so
 * the icon set alone was 5,085 KB.
 *
 * It is invisible in review: the published `dist/index.mjs` is only
 * 250 KB, because Phosphor is external and the weight only materialises
 * once a consumer resolves it.
 *
 * Listing the names explicitly is what fixes it. esbuild can resolve a
 * named re-export statically even when the module it points at is
 * external, so the same call compiles to
 *
 *   import { CaretDownIcon } from '@phosphor-icons/react';
 *   jsx(CaretDownIcon, {})                   // a reference
 *
 * and the consumer's bundler keeps the icons that are reachable and drops
 * the rest.
 *
 * So: **components import from here, never from `../icons`.** The star in
 * `src/icons/index.ts` stays where it is — it is the `@neofloai/atoms/icons`
 * subpath, and there it compiles to a real `export * from` in
 * `dist/icons.mjs`, which is tree-shakable because it is a re-export
 * rather than a bundled namespace.
 *
 * Adding an icon to a component means adding its name below. That is the
 * cost of this approach and it is the whole cost: the list is 16 entries
 * because the design system draws carets, arrows and a close X, and a
 * component reaching for a seventeenth glyph is worth one line here.
 *
 * `scripts/check-icon-leak.mjs` fails the build if the namespace object
 * ever comes back, because nothing else would catch it.
 */

export {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
  CalendarBlankIcon,
  CaretDoubleLeftIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
  ColumnsIcon,
  DotsThreeVerticalIcon,
  EyeSlashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  WarningDiamondIcon,
  XIcon,
} from '@phosphor-icons/react';

/**
 * The icon defaults provider, used once by `NeofloThemeProvider` to set
 * the house size and weight for every glyph below it.
 */
export { IconContext } from '@phosphor-icons/react';

/**
 * `Icon` is the type of a glyph component, for the places that take one as
 * a value — MUI X's slot tables, mostly. `IconProps` is what a component
 * forwarding to a glyph accepts.
 *
 * Types cost nothing at runtime and could come from anywhere, but they
 * come from here so that a component file never has to name
 * `@phosphor-icons/react` at all — which is what makes the leak
 * greppable rather than a thing to remember.
 */
export type { Icon, IconProps, IconWeight } from '@phosphor-icons/react';
