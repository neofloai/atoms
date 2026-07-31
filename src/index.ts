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
 *
 * The one carve-out is an unstyled layout primitive: a component that
 * renders no colour, type, border, or state of its own has no MUI
 * vocabulary to rename and no brand decision to encode, so wrapping it
 * would add a layer that changes nothing while costing capability
 * (see `src/components/Box/Box.tsx` for the concrete loss). `Box` and
 * `Stack` are currently the only such components — a primitive keeps the
 * carve-out even when it has props of its own, provided those props name
 * CSS concepts or token-scale indices rather than design decisions
 * (see `src/components/Stack/Stack.tsx`). Anything with a visual
 * identity — anything a designer could redline — gets wrapped.
 */

export { NeofloThemeProvider } from './theme/ThemeProvider';
export type { NeofloColorMode } from './theme/ThemeProvider';
export { neofloTheme } from './theme';

export { NeofloLogo } from './brand';
export type { NeofloLogoProps, NeofloLogoVariant } from './brand';

export { Alert } from './components/Alert';
export type { AlertProps, AlertSeverity } from './components/Alert';

export { Avatar } from './components/Avatar';
export type {
  AvatarBadgeColor,
  AvatarColor,
  AvatarProps,
  AvatarShape,
  AvatarSize,
} from './components/Avatar';

export { Box } from './components/Box';
export type { BoxProps } from './components/Box';

export { Stack } from './components/Stack';
export type { StackProps } from './components/Stack';

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

export { Select } from './components/Select';
export type { SelectProps, SelectStatus } from './components/Select';

export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';

export { Radio, RadioGroup } from './components/Radio';
export type { RadioGroupProps, RadioProps } from './components/Radio';
