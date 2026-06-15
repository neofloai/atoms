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
export type { NeofloColorMode } from './theme/ThemeProvider';
export { neofloTheme } from './theme';

export { NeofloLogo } from './brand';
export type { NeofloLogoProps, NeofloLogoVariant } from './brand';

export { Avatar } from './components/Avatar';
export type {
  AvatarBadgeColor,
  AvatarColor,
  AvatarProps,
  AvatarShape,
  AvatarSize,
} from './components/Avatar';

export { Button } from './components/Button';
export type {
  ButtonAppearance,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './components/Button';

export { IconButton } from './components/IconButton';
export type {
  IconButtonAppearance,
  IconButtonProps,
  IconButtonSize,
  IconButtonVariant,
} from './components/IconButton';

export { Chip } from './components/Chip';
export type {
  ChipAppearance,
  ChipProps,
  ChipSize,
  ChipVariant,
} from './components/Chip';

export { TextField } from './components/TextField';
export type {
  TextFieldProps,
  TextFieldStatus,
} from './components/TextField';

export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';

export { Radio, RadioGroup } from './components/Radio';
export type { RadioGroupProps, RadioProps } from './components/Radio';
