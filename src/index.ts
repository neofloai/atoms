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
 * The one carve-out is an unstyled primitive: a component that renders
 * no colour, type, border, or state of its own has no MUI vocabulary
 * to rename and no brand decision to encode, so wrapping it would add
 * a layer that changes nothing while costing capability (see
 * `src/components/Box/Box.tsx` for the concrete loss). A primitive
 * keeps the carve-out even when it has props of its own, provided
 * those props name CSS concepts, token-scale indices, or arithmetic
 * against a count the layout declares itself, rather than design
 * decisions. Anything with a visual identity — anything a designer
 * could redline — gets wrapped.
 *
 * Three cases qualify today:
 *
 *   - **Layout primitives** — `Box`, `Stack`, `Grid`, `Container`. Each
 *     records the system-level defaults it deliberately leaves to the
 *     design system in its own file.
 *   - **`CardMedia`** — the one member of the Card family with nothing
 *     to brand. Its three declarations (`display: block`,
 *     `width: 100%`, `object-fit: cover`) are already what the design
 *     draws, its corners come from the parent `Card`, and its height is
 *     a content dimension the caller sets. The other four Card parts
 *     carry surface, border, type, and padding, so all four are
 *     wrapped. See `src/components/Card/CardMedia.tsx`.
 *   - **Motion primitives** — `Fade`, `Grow`, `Slide`, `Zoom`,
 *     `Collapse`. A transition renders no DOM of its own at all: it
 *     clones a child and animates the child's `style`. Its entire API
 *     is a boolean, a duration, and a CSS timing function, none of
 *     which is a Material word, and its timing defaults resolve from
 *     `theme.transitions` at render time — so a re-export is already
 *     themed, while a wrapper with baked-in timings would be *less*
 *     themed. See `src/components/Fade/Fade.tsx`.
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

export { Grid } from './components/Grid';
export type { GridProps } from './components/Grid';

export { Container } from './components/Container';
export type { ContainerProps } from './components/Container';

export { Divider } from './components/Divider';
export type {
  DividerOrientation,
  DividerProps,
  DividerTextAlign,
  DividerTypeMap,
  DividerVariant,
} from './components/Divider';

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

export { Menu } from './components/Menu';
export type { MenuProps } from './components/Menu';

export { MenuItem } from './components/MenuItem';
export type { MenuItemProps, MenuItemVariant } from './components/MenuItem';

export { Skeleton } from './components/Skeleton';
export type {
  SkeletonAnimation,
  SkeletonProps,
  SkeletonVariant,
} from './components/Skeleton';

/**
 * The Card family. `Card` is the shell; the other four are the regions
 * that go inside it. Figma models the eight cells of its component set
 * as content rather than chrome, so there is no variant prop anywhere
 * here — a card is composed, not configured. See
 * `src/components/Card/Card.tsx`.
 */
export {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
} from './components/Card';
export type {
  CardActionsProps,
  CardContentProps,
  CardContentTypeMap,
  CardHeaderProps,
  CardHeaderTypeMap,
  CardProps,
  CardTypeMap,
} from './components/Card';

/**
 * Motion primitives — MUI's five transitions, re-exported under the
 * Neoflo API so consumers never reach into `@mui/material` for them.
 *
 * `Fade` for appearing in place, `Grow` for a surface emerging from
 * its trigger, `Zoom` for a small control, `Slide` for anything that
 * belongs to an edge, `Collapse` for disclosure that reflows the page.
 * All five honour `prefers-reduced-motion` because
 * `src/theme/index.ts` sets `motion: { reducedMotion: 'system' }`.
 *
 * `TransitionProps` is the surface the first four share, exported once
 * for consumers writing a component that accepts "any Atoms
 * transition" and forwards whatever it is given.
 */
export { Fade } from './components/Fade';
export type { FadeProps, TransitionProps } from './components/Fade';

export { Grow } from './components/Grow';
export type { GrowProps } from './components/Grow';

export { Zoom } from './components/Zoom';
export type { ZoomProps } from './components/Zoom';

export { Slide } from './components/Slide';
export type { SlideDirection, SlideProps } from './components/Slide';

export { Collapse } from './components/Collapse';
export type {
  CollapseOrientation,
  CollapseProps,
} from './components/Collapse';
