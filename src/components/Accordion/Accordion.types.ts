import type * as React from 'react';
import type {
  AccordionActionsProps as MuiAccordionActionsProps,
  AccordionDetailsProps as MuiAccordionDetailsProps,
  AccordionSummaryProps as MuiAccordionSummaryProps,
  AccordionSummaryTypeMap as MuiAccordionSummaryTypeMap,
  AccordionTypeMap as MuiAccordionTypeMap,
} from '@mui/material';
import type { OverrideProps } from '@mui/material/OverridableComponent';

/**
 * Public API for the accordion family, from the Figma
 * `accordion-list-items` component set (node 3653:30452).
 *
 * ## Nothing is renamed and nothing is added
 *
 * Unusual for this repo, and worth saying plainly. Every other wrapper
 * here translates Material vocabulary into house words — `Button`'s
 * `appearance`, `Chip`'s `variant`, `Progress`'s `information`. This one
 * has nothing to translate. The Figma set's only axis is `Property 1`
 * with four values (`closed`, `open`, `open-button`, `stack`), and not
 * one of them is a prop:
 *
 *   - `closed` / `open` are the two ends of `expanded`, which MUI
 *     already models both controlled and uncontrolled.
 *   - `open-button` is `open` plus an action row — composition, via
 *     `AccordionActions`, exactly as MUI documents it.
 *   - `stack` is five items as siblings. No wrapper component, no
 *     `AccordionGroup`: the design's stack has zero gap and no shared
 *     chrome, so a `<div>` (or nothing at all) is the container.
 *
 * So the API is MUI's, minus the five props below that the design
 * contradicts. The house work is all in the styling.
 *
 * ## What is locked
 *
 * `Accordion`'s root is a `Paper`, and `Paper` offers four ways to
 * change how a surface is drawn. The design draws one: `surface/layers/
 * card-1`, a 1px `border/layers/card-1` hairline along the bottom edge
 * only, square corners, no shadow. So `variant`, `elevation`, `raised`,
 * and `square` come off the type — the same call `Card` makes, for the
 * same reason (`Card.types.ts`). Each would type-check, resolve to a
 * `box-shadow` or `border-radius` the wrapper overwrites, render no
 * change, and send the caller looking for the bug in their own code.
 *
 * `disableGutters` comes off for a different reason: it is not a
 * decoration, it is a layout mode, and the design picks one. With
 * gutters on — MUI's default — an expanded item grows a 16px margin top
 * and bottom, and the summary's floor rises from 48px to 64px. The
 * `stack` variant measures 333px for four closed items and one open one,
 * which is 4 × 53 + 121 exactly: no margin anywhere, and a 52px summary.
 * Since gutters are permanently off, the prop is removed rather than
 * left as a way to break the layout. `sx={{ my: 2 }}` still spaces items
 * out if a composition wants that.
 *
 * The removals are typed as an `Omit`, so they fail at compile time.
 */
type LockedAccordionProp =
  | 'variant'
  | 'elevation'
  | 'raised'
  | 'square'
  | 'disableGutters';

/**
 * MUI's `AccordionTypeMap` with the five locked props removed, so the
 * component keeps its polymorphic root while refusing the props that
 * would silently do nothing.
 */
export interface AccordionTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> {
  props: AdditionalProps &
    Omit<
      MuiAccordionTypeMap<object, RootComponent>['props'],
      LockedAccordionProp
    >;
  defaultComponent: RootComponent;
}

/**
 * Props for the Neoflo `Accordion` — the item shell and the thing that
 * owns `expanded`.
 *
 * MUI's `AccordionProps` minus `variant` / `elevation` / `raised` /
 * `square` / `disableGutters` (see `LockedAccordionProp`), and nothing
 * added. `expanded`, `defaultExpanded`, `onChange`, `disabled`,
 * `children`, `slots`, `slotProps`, `sx`, and `component` all behave as
 * MUI documents them.
 *
 * The type parameters exist so the root stays swappable and
 * type-checked, as on `Card` and `Divider`. It matters here: a group of
 * accordions is often a `<section>`, and each item's shell is a
 * reasonable `<article>`.
 *
 * @example Typing a wrapper of your own
 * interface FaqItemProps extends AccordionProps {
 *   question: string;
 * }
 */
export type AccordionProps<
  RootComponent extends React.ElementType = 'div',
  AdditionalProps = object,
> = OverrideProps<
  AccordionTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

/**
 * Props for `AccordionSummary` — the always-visible header row, and the
 * button that toggles the item.
 *
 * MUI's own props, unchanged. One default differs: `expandIcon` starts
 * as a 16px `CaretDown`, because the design draws a caret in all four
 * variants and no accordion here should need the caller to import an
 * icon to look right. Pass a different node to replace it, or
 * `expandIcon={null}` to drop it — see `AccordionSummary.tsx` for why
 * `null` works and why the rotation MUI applies is the design's second
 * glyph exactly.
 */
export type AccordionSummaryProps<
  RootComponent extends React.ElementType = 'div',
  AdditionalProps = object,
> = MuiAccordionSummaryProps<RootComponent, AdditionalProps>;

/**
 * MUI's `AccordionSummaryTypeMap`, re-exported so the summary can be
 * typed as `ExtendButtonBase` the way MUI types it, keeping the
 * polymorphic root and `ButtonBase`'s own props.
 *
 * `AdditionalProps` defaults to `object` rather than MUI's `{}`, which
 * this repo's lint config rejects; the two are equivalent as an
 * intersection operand.
 */
export type AccordionSummaryTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> = MuiAccordionSummaryTypeMap<AdditionalProps, RootComponent>;

/**
 * Props for `AccordionDetails` — the body that the summary reveals.
 *
 * MUI's own props, unchanged. The wrapper supplies the design's type and
 * colour (13/20 in `text/default/b2`) and its padding, so a plain string
 * child is already correct; anything richer composes normally.
 */
export type AccordionDetailsProps = MuiAccordionDetailsProps;

/**
 * Props for `AccordionActions` — the trailing button row from the
 * `open-button` variant (node 3653:30450).
 *
 * MUI's own props, unchanged, `disableSpacing` included. MUI's default
 * spacing between two buttons is already 8px, which is the `Scale/200`
 * the design specifies, so the only thing the wrapper changes is the
 * padding.
 */
export type AccordionActionsProps = MuiAccordionActionsProps;
