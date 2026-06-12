/**
 * Ambient module declarations for CSS side-effect imports.
 *
 * The `@fontsource` stylesheets imported in `src/theme/fonts.ts` are loaded
 * purely for their `@font-face` side effects; they have no JS exports and no
 * shipped type declarations. This lets TypeScript accept `import './x.css'`.
 */
declare module '*.css';
