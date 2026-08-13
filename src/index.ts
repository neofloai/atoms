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

export { Badge } from './components/Badge';
export type { BadgeColor, BadgeProps } from './components/Badge';

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

/**
 * `Link` narrows one prop (`color`, to the house roles) and adds none.
 * Unlike every other component here it is not a `styled()` wrapper — MUI
 * `Link` is a plain `forwardRef`, so its styling has to ride on `sx` to
 * land in the right place in the cascade. See `Link.tsx`.
 */
export { Link } from './components/Link';
export type {
  LinkColor,
  LinkProps,
  LinkTypeMap,
  LinkUnderline,
} from './components/Link';

export { TextField } from './components/TextField';
export type {
  TextFieldProps,
  TextFieldStatus,
} from './components/TextField';

export { Select } from './components/Select';
export type { SelectProps, SelectStatus } from './components/Select';

/**
 * The two components built on MUI **X** rather than MUI Material, because
 * Material has neither a date nor a time picker. MUI X's community tier is
 * MIT-licensed, and `@mui/x-date-pickers` is a direct dependency alongside
 * `@mui/material`.
 *
 * Their value is a **Day.js** object, not a native `Date`. Day.js is the
 * date library Atoms standardises on — MUI X requires one, and pinning a
 * single choice is what keeps every Neoflo app agreeing on one date type.
 * The adapter is installed by `NeofloThemeProvider`, so a picker below it
 * needs no setup; one rendered outside it throws, because MUI X reads its
 * adapter from context. A `TimePicker`'s value carries a date as well as a
 * time, because Day.js has no time-only type.
 *
 * MUI X's whole prop surface survives on both. Only the responsive variants
 * are not exported: each picker already switches between the desktop
 * popover and the mobile modal itself, off `desktopModeMediaQuery`. The
 * same four props are lifted out of `slotProps` on both, so a picker reads
 * like the `TextField` beside it — see the two `*.types.ts` files.
 *
 * They share their field and their popover, held in
 * `src/components/_shared/pickerTokens.ts` and `pickerStyles.tsx`; only the
 * view inside the panel is written per component.
 */
export { DatePicker } from './components/DatePicker';
export type { DatePickerProps, DatePickerStatus } from './components/DatePicker';

export { TimePicker } from './components/TimePicker';
export type { TimePickerProps, TimePickerStatus } from './components/TimePicker';

export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';

export { Radio, RadioGroup } from './components/Radio';
export type { RadioGroupProps, RadioProps } from './components/Radio';

export { Switch } from './components/Switch';
export type { SwitchProps } from './components/Switch';

export { Slider } from './components/Slider';
export type { SliderProps, SliderSize } from './components/Slider';

/**
 * The two components MUI documents on one Toggle Button page, sharing
 * one colour table (`src/components/ToggleButton/toggleButtonTokens.ts`)
 * so a grouped toggle and a standalone one cannot drift apart. The group
 * passes `color` / `size` / `appearance` down to its children, and a
 * child's own prop wins.
 */
export { ToggleButton, ToggleButtonGroup } from './components/ToggleButton';
export type {
  ToggleButtonAppearance,
  ToggleButtonColor,
  ToggleButtonGroupProps,
  ToggleButtonProps,
  ToggleButtonSize,
} from './components/ToggleButton';

/**
 * The accordion family — MUI's four parts, all four of which the Figma
 * set draws (node 3653:30452). `Accordion` is the item and owns
 * `expanded`; `AccordionSummary` is the header row and the button;
 * `AccordionDetails` is the body; `AccordionActions` is the trailing
 * button row from the `open-button` variant.
 *
 * No prop is renamed and none is added: the set's four variants are
 * `expanded`, composition, and a stack of siblings, all of which MUI
 * already models. Five Paper/layout props are locked shut instead — see
 * `src/components/Accordion/Accordion.types.ts`.
 */
export {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
} from './components/Accordion';
export type {
  AccordionActionsProps,
  AccordionDetailsProps,
  AccordionProps,
  AccordionSummaryProps,
  AccordionSummaryTypeMap,
  AccordionTypeMap,
} from './components/Accordion';

/**
 * The tab family — MUI's `Tabs` and `Tab`, matching the two Figma
 * components (`tabs` 3463:12630 and `tab-items` 3463:12373). `Tabs` owns
 * the bar's rule, the 24px rhythm, and the indicator; `Tab` owns one
 * label and its optional count.
 *
 * Two of MUI's props are dropped (`textColor`, `indicatorColor` — this
 * design has no colour axis) and two are added: `disabled` on the bar,
 * which is Figma's `enabled` axis, and `count` on a tab, which is its
 * `tag` axis. The panels are not part of it — MUI ships no `TabPanel`
 * and there is no Figma node for one. See
 * `src/components/Tabs/Tabs.types.ts`.
 */
export { Tab, Tabs } from './components/Tabs';
export type { TabProps, TabsProps } from './components/Tabs';

/**
 * The stepper family — MUI's `Stepper` / `Step` / `StepLabel` /
 * `StepContent` / `StepConnector`, matching the Figma `stepper` component
 * set (node 3663:40573), plus `StepCollapse`.
 *
 * Nothing is renamed and nothing is dropped. One MUI default moves —
 * `orientation`, to `'vertical'`, which is the only direction the design
 * draws. Figma's `done` / `not-done` axis is MUI's own step state, and its
 * `title` / `text` / `action` axis is content rather than a prop: a step is
 * a `StepLabel` plus, optionally, a `StepContent`.
 *
 * `StepCollapse` is the one part with no MUI counterpart — the `collapse`
 * cell, a row that folds a run of steps up. It assembles `ButtonBase` and
 * the `expanded` + `onChange` pair `Accordion` uses rather than inventing
 * behaviour. See `src/components/Stepper/Stepper.types.ts`.
 */
export {
  Step,
  StepCollapse,
  StepConnector,
  StepContent,
  StepLabel,
  Stepper,
} from './components/Stepper';
export type {
  StepCollapseProps,
  StepConnectorProps,
  StepContentProps,
  StepLabelProps,
  StepProps,
  StepTypeMap,
  StepperProps,
  StepperTypeMap,
} from './components/Stepper';

export { Menu } from './components/Menu';
export type { MenuProps } from './components/Menu';

export { MenuItem } from './components/MenuItem';
export type { MenuItemProps, MenuItemVariant } from './components/MenuItem';

export { Tooltip } from './components/Tooltip';
export type { TooltipProps } from './components/Tooltip';

export { Skeleton } from './components/Skeleton';
export type {
  SkeletonAnimation,
  SkeletonProps,
  SkeletonVariant,
} from './components/Skeleton';

/**
 * The progress family — the two indicators MUI documents on one page,
 * sharing one colour table (`src/components/Progress/progressTokens.ts`)
 * so the arc and the bar cannot drift apart. `CircularProgress` for a
 * busy control, `LinearProgress` for a loading region.
 */
export { CircularProgress, LinearProgress } from './components/Progress';
export type {
  CircularProgressProps,
  LinearProgressProps,
  ProgressColor,
} from './components/Progress';

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
