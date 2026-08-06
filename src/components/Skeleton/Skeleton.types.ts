import type * as React from 'react';
import type {
  SkeletonProps as MuiSkeletonProps,
  SkeletonTypeMap as MuiSkeletonTypeMap,
} from '@mui/material';

/**
 * Props for the Neoflo `Skeleton`.
 *
 * Identical to MUI's `SkeletonProps` — nothing is remapped, removed, or
 * added. There is no Neoflo vocabulary to put in front of MUI's here:
 * `variant` already names shapes (`text` / `rectangular` / `rounded` /
 * `circular`) rather than Material jargon, and `animation` names a
 * behaviour. Renaming either would be reinvention, which
 * `.cursor/rules/10-mui-usage.mdc` rules out. The wrapper exists to
 * carry the reduced-motion behaviour and the branded export, not to
 * change the API.
 *
 * The type parameters exist for the same reason they do on `MenuItem`:
 * MUI declares `Skeleton` as an `OverridableComponent`, so its root is
 * swappable and the element's own props are type-checked against it. A
 * plain `forwardRef` wrapper would pin the root at `span` and silently
 * drop those props, so `<Skeleton component="div" />` would keep
 * working at runtime while failing to compile.
 *
 * `AdditionalProps` defaults to `object` rather than MUI's `{}`, which
 * the `@typescript-eslint/no-empty-object-type` rule rejects. The two
 * are equivalent as an intersection operand.
 *
 * @example Typing a wrapper of your own
 * interface RowSkeletonProps extends SkeletonProps {
 *   rows?: number;
 * }
 */
export type SkeletonProps<
  RootComponent extends React.ElementType = 'span',
  AdditionalProps = object,
> = MuiSkeletonProps<RootComponent, AdditionalProps>;

/**
 * MUI's own type map for `Skeleton`, re-exported so the component can be
 * declared with the same `OverridableComponent<…>` shape MUI uses and
 * keep its polymorphic root.
 */
export type SkeletonTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'span',
> = MuiSkeletonTypeMap<AdditionalProps, RootComponent>;

/**
 * Shape of the placeholder.
 *
 * Derived from MUI's own union rather than redeclared, so it cannot
 * drift from it and so module augmentation of
 * `SkeletonPropsVariantOverrides` still applies. Exported for consumers
 * typing their own loading-state components.
 */
export type SkeletonVariant = NonNullable<MuiSkeletonProps['variant']>;

/**
 * Animation of the placeholder — `'pulse'`, `'wave'`, or `false` for a
 * static block. Derived from MUI's union, as `SkeletonVariant` is.
 */
export type SkeletonAnimation = NonNullable<MuiSkeletonProps['animation']>;
