import type * as React from 'react';
import type {
  CardActionsProps as MuiCardActionsProps,
  CardContentTypeMap as MuiCardContentTypeMap,
  CardHeaderTypeMap as MuiCardHeaderTypeMap,
  CardTypeMap as MuiCardTypeMap,
} from '@mui/material';
import type { OverrideProps } from '@mui/material/OverridableComponent';

/**
 * Surface props the card locks shut.
 *
 * `Card` extends MUI `Paper`, which exposes four ways to change how the
 * surface is drawn. The Figma component set (node 3648:24947) draws
 * exactly one card — `surface/layers/card-1` behind a 1px
 * `border/layers/card-1`, corners at `Scale/300`, no shadow — across all
 * eight symbols. There is no elevated card, no square card, and no
 * shadowed card in the design.
 *
 * They are removed from the type rather than left to be ignored.
 * `variant`, `elevation`, and `raised` all resolve to a `box-shadow`
 * that the wrapper overwrites with `none`, and `square` resolves to a
 * `border-radius` the wrapper overwrites with 16 — so every one of them
 * would type-check, render no change, and leave the caller looking for
 * the bug in their own code. A compiler error is the better failure.
 *
 * If an elevated card is wanted, it needs a Figma cell first.
 */
type LockedSurfaceProp = 'variant' | 'elevation' | 'raised' | 'square';

/**
 * MUI's `CardTypeMap` with the four locked surface props removed, so the
 * component can keep its polymorphic root while refusing the props that
 * would silently do nothing.
 */
export interface CardTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> {
  props: AdditionalProps &
    Omit<MuiCardTypeMap<object, RootComponent>['props'], LockedSurfaceProp>;
  defaultComponent: RootComponent;
}

/**
 * Props for the Neoflo `Card` — the shell. MUI's `CardProps` minus
 * `variant` / `elevation` / `raised` / `square` (see
 * `LockedSurfaceProp`), and nothing added.
 *
 * The type parameters exist for the same reason they do on `Divider` and
 * `Skeleton`: MUI declares `Card` as an `OverridableComponent`, so its
 * root is swappable and the element's own props are type-checked against
 * it. That matters here more than on most components — a card is very
 * often an `<article>` or a `<section>` rather than a bare `<div>`, and
 * a plain `forwardRef` wrapper would pin the root and drop the swapped
 * element's props while still rendering it at runtime.
 *
 * `AdditionalProps` defaults to `object` rather than MUI's `{}`, which
 * the `@typescript-eslint/no-empty-object-type` rule rejects. The two
 * are equivalent as an intersection operand.
 *
 * @example Typing a wrapper of your own
 * interface MetricCardProps extends CardProps {
 *   metric: string;
 * }
 */
export type CardProps<
  RootComponent extends React.ElementType = 'div',
  AdditionalProps = object,
> = OverrideProps<
  CardTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

/**
 * MUI's type map for `CardHeader`, re-exported so the wrapper keeps its
 * polymorphic root (`component="header"`).
 *
 * MUI's own declaration carries two further generics for the title and
 * subheader Typography components. They are dropped here: this wrapper
 * styles the two lines through their classes rather than through
 * `slotProps`, so the generics would only ever type a slot override the
 * design does not ask for.
 */
export type CardHeaderTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> = MuiCardHeaderTypeMap<AdditionalProps, RootComponent>;

/**
 * Props for the Neoflo `CardHeader` — the title-and-description block.
 *
 * Identical to MUI's: `title`, `subheader`, `avatar`, `action`,
 * `disableTypography`, plus the usual `component` / `sx` / `classes` /
 * `slots` / `slotProps`. Nothing is remapped. The wrapper carries the
 * type ramp and the two text colours, not a new API.
 *
 * Figma's `text` header (node 3653:30103) is exactly `title` +
 * `subheader`, which is why this maps one-to-one. Its `info` header
 * (node 3653:30106) does not — the badge there sits directly beside the
 * metric rather than pushed to the far edge, so that layout is a
 * composition inside `CardContent`, not this component with an
 * `action`. See `CardHeader.tsx`.
 */
export type CardHeaderProps<
  RootComponent extends React.ElementType = 'div',
  AdditionalProps = object,
> = OverrideProps<
  CardHeaderTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

/**
 * MUI's type map for `CardContent`, re-exported so the wrapper keeps its
 * polymorphic root.
 */
export type CardContentTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> = MuiCardContentTypeMap<AdditionalProps, RootComponent>;

/**
 * Props for the Neoflo `CardContent` — a padded region for body content.
 *
 * Identical to MUI's. The wrapper changes two numbers and no props: the
 * padding comes off `Scale/300` on all four sides, and Material's
 * 24px-when-last bottom padding is dropped.
 */
export type CardContentProps<
  RootComponent extends React.ElementType = 'div',
  AdditionalProps = object,
> = OverrideProps<
  CardContentTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

/**
 * Props for the Neoflo `CardActions` — the trailing row of buttons.
 *
 * Identical to MUI's `CardActionsProps`, which is not polymorphic: MUI
 * declares this one as a plain `div` with no `component` prop, so there
 * is no type map to restate. `disableSpacing` still turns off the 8px
 * gap between children.
 */
export type CardActionsProps = MuiCardActionsProps;
