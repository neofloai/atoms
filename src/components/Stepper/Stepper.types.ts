import type * as React from 'react';
import type {
  ButtonBaseProps,
  StepConnectorProps as MuiStepConnectorProps,
  StepContentProps as MuiStepContentProps,
  StepLabelProps as MuiStepLabelProps,
  StepProps as MuiStepProps,
  StepTypeMap as MuiStepTypeMap,
  StepperProps as MuiStepperProps,
  StepperTypeMap as MuiStepperTypeMap,
} from '@mui/material';

/**
 * Public API for the stepper family, from the Product Design System Figma
 * (node 3663:40573).
 *
 * MUI's prop surface survives whole. Nothing is renamed, nothing is
 * dropped, and one default moves — `orientation`. The reason is that the
 * two axes Figma draws map onto things MUI already has:
 *
 * - **`done` / `not-done`** is MUI's own step state. In a linear stepper
 *   it falls out of `activeStep`: the steps before it are `completed`,
 *   the one at it is `active`, the rest are `disabled`. `done` covers
 *   `active` and `completed` together, because a step you are standing on
 *   has been reached. Set `completed` per step for a timeline whose order
 *   is not an index.
 * - **`title` / `text` / `action`** is content, not state. A step is a
 *   `StepLabel` for the header plus, optionally, a `StepContent` holding
 *   the description and any buttons. `title` is the label on its own;
 *   `text` and `action` are the same component with more inside it.
 * - **`last`** is MUI's `last`, which `Stepper` already sets on its final
 *   child. It swaps the dot for a pin and drops the line — and MUI
 *   already drops the line, via `.MuiStepContent-last`.
 *
 * Which leaves `collapse` as the only cell MUI has no component for. See
 * `StepCollapseProps`.
 *
 * ## The one thing to know before using it
 *
 * `StepContent` renders only while its step is `active` — that is MUI's
 * wizard behaviour, and it is right for a form. Figma draws a timeline
 * instead, with every description visible at once. The switch for that is
 * MUI's, not ours: put `expanded` on each `Step`.
 */

/**
 * `Stepper` props. Everything not listed here is MUI's, unchanged:
 * `activeStep`, `children`, `nonLinear`, `alternativeLabel`, `connector`,
 * plus `sx` / `classes` / `component`.
 */
export interface StepperProps extends MuiStepperProps {
  /**
   * Which way the steps run.
   *
   * **This is the one MUI default this family moves** — MUI ships
   * `'horizontal'`. Every cell in the Figma set is vertical: a 12px
   * indicator column with a 2px rule down it and the text 16px to its
   * right. A horizontal stepper is not drawn anywhere in the design
   * system, so `'horizontal'` still works and still reads from these
   * tokens, but it is derived rather than specified — the dot, the line
   * and the type are the vertical set's, turned on their side.
   *
   * @default 'vertical'
   */
  orientation?: MuiStepperProps['orientation'];
}

/**
 * MUI's `StepperTypeMap`, restated so the wrapper keeps its polymorphic
 * root. `forwardRef` alone pins the root at MUI's declared default and
 * drops `component`, which would make `<Stepper component="section">`
 * render correctly and fail to compile — the reason `Card` and
 * `Accordion` restate theirs.
 */
export interface StepperTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> {
  props: AdditionalProps & MuiStepperTypeMap<object, RootComponent>['props'];
  defaultComponent: RootComponent;
}

/** MUI's `StepTypeMap`, restated for the same reason. */
export interface StepTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> {
  props: AdditionalProps & MuiStepTypeMap<object, RootComponent>['props'];
  defaultComponent: RootComponent;
}

/**
 * `Step` props. Everything is MUI's, unchanged: `active`, `completed`,
 * `disabled`, `expanded`, `index`, `last`, plus `sx` / `classes` /
 * `component`.
 *
 * `index` and `last` are injected by the parent `Stepper`, which clones
 * its children to hand them out. Passing either explicitly wins over the
 * injected value — that is MUI's precedence, not something added here.
 */
export interface StepProps extends MuiStepProps {
  /**
   * Keeps this step's `StepContent` mounted and open regardless of
   * whether the step is active.
   *
   * Called out because it is what turns a wizard into the timeline Figma
   * draws. Without it only the active step shows its description.
   *
   * @default false
   */
  expanded?: boolean;
}

/**
 * `StepLabel` props. Everything is MUI's, unchanged: `children` for the
 * header, `error`, `icon`, `optional`, `slots` / `slotProps`, plus `sx` /
 * `classes`.
 *
 * The `stepIcon` slot is filled in with the house indicator — the 8px
 * dot, or the pin on the last step. Replacing `slots.stepIcon` replaces
 * it; passing `icon` keeps the house indicator's box and puts your node
 * inside it, which is how the collapse row gets its vertical ellipsis.
 */
export interface StepLabelProps extends MuiStepLabelProps {
  /**
   * Marks the step as failed. Not drawn in the Figma set — the dot takes
   * the house `error` fill and the header its caption ink, derived the
   * same way `Button`'s error role is.
   *
   * @default false
   */
  error?: boolean;
}

/**
 * `StepContent` props. Everything is MUI's, unchanged: `children`,
 * `transitionDuration`, `slots` / `slotProps` for the transition, plus
 * `sx` / `classes`.
 *
 * This is the region beside the line — the description in Figma's `text`
 * cell and the description plus buttons in `action`. Stack what goes in
 * it with 16px gaps (`Stack spacing={2}`) to match the design, and note
 * that MUI mounts it only while the step is `active` unless the `Step`
 * carries `expanded`.
 */
export type StepContentProps = MuiStepContentProps;

/**
 * `StepConnector` props — MUI's, unchanged. `Stepper` already supplies a
 * house-styled one, so this is only needed to pass `sx` or `classes` to a
 * connector you are placing yourself.
 */
export type StepConnectorProps = MuiStepConnectorProps;

/**
 * `StepCollapse` props.
 *
 * This is the Figma set's `collapse` cell (nodes 3663:40572 and
 * 3663:40568) and the one part of it MUI has no component for: a step-
 * shaped row that hides or reveals the steps around it, drawn as a
 * vertical ellipsis in the indicator column and a bare primary-ink label
 * beside it.
 *
 * It invents no behaviour. The disclosure is `expanded` plus
 * `onChange(event, expanded)` — the same controlled pair `Accordion`
 * uses — and the row itself is a MUI `ButtonBase`, so focus, keyboard
 * activation and the ripple are MUI's. It is a `Step` child like any
 * other, so the lines above and below it come from the connectors either
 * side rather than from anything here.
 */
export interface StepCollapseProps
  extends Omit<ButtonBaseProps, 'children' | 'onChange'> {
  /**
   * Whether the steps this row controls are showing. Controlled — hold it
   * in state and flip it from `onChange`.
   *
   * @default false
   */
  expanded?: boolean;
  /**
   * How many steps are hidden while collapsed, which is what the default
   * collapsed label counts: `count={3}` renders "+ 3 more events". Left
   * out, the row reads "Show more events" instead. Either way it is
   * ignored once `expanded` is true, and ignored entirely if you pass
   * `children`.
   */
  count?: number;
  /**
   * Fired when the row is activated, with the state it is moving *to* as
   * the second argument.
   */
  onChange?: (
    event: React.MouseEvent<HTMLButtonElement>,
    expanded: boolean
  ) => void;
  /**
   * Replaces the label. The default follows Figma — "+ N more events"
   * collapsed, "Collapse events" expanded — which names a domain the rest
   * of this library does not, so anything that is not a feed of events
   * should pass its own noun.
   */
  children?: React.ReactNode;
}
