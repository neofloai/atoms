import type * as React from 'react';
import type {
  DividerProps as MuiDividerProps,
  DividerTypeMap as MuiDividerTypeMap,
} from '@mui/material';

/**
 * Props for the Neoflo `Divider`.
 *
 * Identical to MUI's `DividerProps` — nothing is remapped, removed, or
 * added. `orientation`, `flexItem`, and `textAlign` all name CSS
 * concepts rather than Material jargon, and `children` / `component` /
 * `sx` / `classes` behave exactly as documented for MUI `Divider`. The
 * wrapper exists to carry the token-correct hairline colour and the
 * branded export, not to change the API.
 *
 * The one prop that *is* Material vocabulary is `variant` — see
 * `Divider.tsx` for why its inset geometry was left on MUI's numbers
 * rather than replaced with values nobody specified.
 *
 * The type parameters exist for the same reason they do on `Skeleton`
 * and `MenuItem`: MUI declares `Divider` as an `OverridableComponent`,
 * so its root is swappable and the element's own props are type-checked
 * against it. A plain `forwardRef` wrapper would pin the root at `hr`
 * and silently drop those props, so `<Divider component="li" />` — the
 * form a divider inside a list has to take — would keep working at
 * runtime while failing to compile.
 *
 * `AdditionalProps` defaults to `object` rather than MUI's `{}`, which
 * the `@typescript-eslint/no-empty-object-type` rule rejects. The two
 * are equivalent as an intersection operand.
 *
 * @example Typing a wrapper of your own
 * interface SectionRuleProps extends DividerProps {
 *   label?: string;
 * }
 */
export type DividerProps<
  RootComponent extends React.ElementType = 'hr',
  AdditionalProps = object,
> = MuiDividerProps<RootComponent, AdditionalProps>;

/**
 * MUI's own type map for `Divider`, re-exported so the component can be
 * declared with the same `OverridableComponent<…>` shape MUI uses and
 * keep its polymorphic root.
 */
export type DividerTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'hr',
> = MuiDividerTypeMap<AdditionalProps, RootComponent>;

/**
 * Axis the rule runs along.
 *
 * Derived from MUI's own union rather than redeclared, so it cannot
 * drift from it. Exported for consumers typing their own separated
 * layouts.
 */
export type DividerOrientation = NonNullable<MuiDividerProps['orientation']>;

/**
 * How far the rule is inset from its container: `fullWidth` edge to
 * edge, `inset` indented from the leading edge only, `middle` indented
 * from both.
 *
 * Derived from MUI's union so module augmentation of
 * `DividerPropsVariantOverrides` still applies.
 */
export type DividerVariant = NonNullable<MuiDividerProps['variant']>;

/**
 * Where the label sits along the rule, when the divider has children.
 * Ignored on a vertical divider, which always centres.
 */
export type DividerTextAlign = NonNullable<MuiDividerProps['textAlign']>;
