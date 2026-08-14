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
export type { TextFieldProps, TextFieldStatus } from './components/TextField';

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
export type {
  DatePickerProps,
  DatePickerStatus,
} from './components/DatePicker';

export { TimePicker } from './components/TimePicker';
export type {
  TimePickerProps,
  TimePickerStatus,
} from './components/TimePicker';

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
 * The Dialog family — a modal panel that interrupts the page to ask for a
 * decision. `Dialog` is the shell; the other four are the regions inside
 * it, mirroring MUI's own composition.
 *
 * The panel is `Card`'s shell to the token — the same `card 1` fill, the
 * same 1px `card 1` edge, the same 16px corners — so a dialog and a card
 * on one page cannot drift apart. It carries no shadow, because the
 * backdrop does the separating.
 *
 * `DialogTitle` is the one place with an API beyond MUI's: Figma draws a
 * subtitle, an icon badge and a close button in every one of its title
 * cells, and MUI's title is a single `Typography` with room for none of
 * them. See `src/components/Dialog/DialogTitle.tsx`.
 */
export {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from './components/Dialog';
export type {
  DialogActionsProps,
  DialogContentProps,
  DialogContentTextProps,
  DialogProps,
  DialogTitleProps,
} from './components/Dialog';

/**
 * The two halves of an app shell — the bar across the top and the panel
 * down the side. They are exported together because they are drawn
 * together: both take `surface/layers/card 2` behind a 1px
 * `border/layers/card 2`, so a bar and a rail meeting at the corner
 * match, and neither needs styling of its own to look like it belongs.
 *
 * That is one rung above the `card 1` a `Card` or a `Dialog` takes, and
 * deliberately so — chrome sits above content on the neutral ladder, so a
 * card on the page reads as sitting *on* the app rather than beside it.
 * Both frames of the shell they were drawn for bind that pair
 * independently, the bar as well as the rail.
 *
 * Neither has a cell in the Product Design System file. Their colour comes
 * from the app's own frames, and their dimensions — the bar's 48px height,
 * the rail's 220px width, the sheet's 400 and 520 — are measured from the
 * Vendor Query shell, the one place a Neoflo drawer and navbar ship today.
 *
 * `Drawer` adds one prop to MUI's and locks nothing. `Navbar` folds MUI's
 * `Toolbar` into its `AppBar`, because the two are never useful apart,
 * and locks the four props that would recolour a bar that has one
 * treatment. Both flatten MUI's shadow and leave `elevation` reachable
 * through `sx` or `slotProps`, the seam `Dialog` opened.
 */
export { Drawer } from './components/Drawer';
export type {
  DrawerAnchor,
  DrawerProps,
  DrawerSize,
  DrawerVariant,
} from './components/Drawer';

/**
 * `Navbar` has two rungs, and they are two kinds of bar. `size="sm"` is
 * the 48px app bar that spans a screen; `size="md"` is the 72px page
 * header, tall enough for a title with a line of context under it and the
 * actions that apply to the record on screen. Only the height differs —
 * surface, rule, gutter and row are identical — so it is a `size` rather
 * than a `variant`, and what fills the bar is composition either way.
 *
 * `NavbarTitle` is the one part of a page header that is geometry rather
 * than composition: the title, the 4px gap, and a `meta` row of glyphs and
 * labels separated by vertical rules. The actions stay with the caller,
 * because whether a page's action is destructive or confirming is a
 * decision about the page and not about its header.
 *
 * `NAVBAR_HEIGHT_PX` is keyed by size and ships alongside them, because
 * two layout problems need the number and cannot read it off the DOM: a
 * `fixed` bar is out of flow and the page under it needs a spacer exactly
 * that tall, and anything sharing a baseline with the bar's contents — the
 * first row of a rail beside it — has to match it.
 */
export {
  NAVBAR_HEIGHT_PX,
  NAVBAR_META_ICON_PX,
  Navbar,
  NavbarTitle,
} from './components/Navbar';
export type {
  NavbarMetaItem,
  NavbarPosition,
  NavbarProps,
  NavbarSize,
  NavbarTitleProps,
} from './components/Navbar';

/**
 * The table family — seven pieces that only make sense together, so they
 * ship together the way the dialog's five do.
 *
 * This is the simple table, and it is the right default: it renders the
 * markup you write, so a cell holds a `Chip` or an `Avatar` or two lines
 * of text without a column definition, and it ships nothing you are not
 * using. `DataGrid`, below, is the one to reach for when the table is the
 * screen's work rather than one of its panels — thousands of rows to
 * virtualise, sorting and filtering and pagination you would otherwise
 * write by hand, inline editing, CSV export.
 *
 * Three things about the design are worth knowing before reading the
 * props, because each explains a piece of the API:
 *
 *   - **A table draws no edge.** No border, no radius, no shadow, no fill
 *     of its own — the Figma set is 320 tall for a header and six 48px
 *     rows, which is `32 + 6 × 48` with nothing left over. So it takes
 *     the colour of whatever it is dropped onto, and the edge around it
 *     is a `Card`'s to draw.
 *   - **Density belongs to the table.** One `size` — 48, 56 or 64 —
 *     reaches every row through context, because MUI's own `size` holds
 *     two values where the design has three. The header stays 32 in all
 *     three: it is a label strip rather than a row of data.
 *   - **`State` is not one prop.** Four of the design's six row states
 *     are things MUI's row already models (`hover`, `selected`,
 *     `disabled`, plain); the two that are left describe the data rather
 *     than the pointer, and arrive as `state` on the row.
 *
 * `TABLE_ROW_HEIGHT_PX` and `TABLE_HEADER_ROW_HEIGHT_PX` ship alongside,
 * for the layout problems that need the number and cannot read it off the
 * DOM — a `Skeleton` standing in for a row while it loads, or a virtual
 * list that has to know a row's height before rendering one.
 */
export {
  TABLE_HEADER_ROW_HEIGHT_PX,
  TABLE_ROW_HEIGHT_PX,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from './components/Table';
export type {
  TableBodyProps,
  TableCellProps,
  TableContainerProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
  TableRowState,
  TableSize,
  TableSortLabelProps,
} from './components/Table';

/**
 * The same design, driven by MUI X's grid engine — for when the table is
 * the screen's work rather than one of its panels.
 *
 * Everything the community grid documents survives: virtualised rows,
 * sorting, filtering, pagination, inline editing, selection, CSV export,
 * server-side data. That is the whole reason to be here, so none of it is
 * renamed or wrapped. What the wrapper changes is the look, and three
 * decisions inside it are worth knowing:
 *
 *   - **The frame goes.** MUI borders and rounds the grid and fills it
 *     with `background.paper`; the design draws the same stack of bands
 *     the table does, hairline under every row including the last, no
 *     edge of its own. A grid needs a *height* though — MUI's root is
 *     `height: 100%`, so a grid in an unsized parent renders as a line.
 *     There is a 320px floor to stop that happening silently.
 *   - **`size` is the density,** 48 / 56 / 64 over a flat 32px header, the
 *     same three values `Table` takes. It replaces `rowHeight`,
 *     `columnHeaderHeight` and `density`, which are the same fact stated
 *     three times and disagree the moment two of them are set.
 *   - **The footer is rewritten.** MUI's is a rows-per-page `Select` and
 *     two arrows; the design's is `1–20 of 278 transactions` and three
 *     filled buttons, where the jump-to-start appears only once you have
 *     left the first page. `rowNoun` is what it counts in.
 *
 * Row tints come from `rowState`, a function of the row rather than a
 * prop, because a grid has no per-row markup to hang one on. And a column
 * menu words its sort rows from the column's type — "Low to high" for a
 * number, "A to Z" for a string, "Old to new" for a date — which is what
 * Figma draws three separate menus to say.
 */
export {
  DATA_GRID_HEADER_HEIGHT_PX,
  DATA_GRID_ROW_HEIGHT_PX,
  DataGrid,
} from './components/DataGrid';
export type {
  DataGridProps,
  DataGridRowState,
  DataGridSize,
} from './components/DataGrid';

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
export type { CollapseOrientation, CollapseProps } from './components/Collapse';
