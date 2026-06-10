/**
 * Public package entry for `@neoflo/atoms`.
 *
 * Consumers should only import from this barrel or one of the
 * subpath exports declared in `package.json`:
 *
 *   - `@neoflo/atoms`         theme provider, future wrapper components
 *   - `@neoflo/atoms/icons`   every Phosphor icon, tree-shakable
 *   - `@neoflo/atoms/tokens`  raw + semantic design tokens
 *   - `@neoflo/atoms/theme`   the constructed MUI theme object
 *
 * Do not re-export from `@mui/material` or `@phosphor-icons/react`
 * here — consumers must see the Neoflo API, never the underlying
 * libraries.
 */

export { NeofloThemeProvider } from './theme/ThemeProvider';
export { neofloTheme } from './theme';

export { Button } from './components/Button';
export type {
  ButtonAppearance,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './components/Button';
