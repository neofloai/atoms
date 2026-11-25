import type { AvatarColor } from '../Avatar';

/** One workspace the user can switch to. */
export interface WorkspaceOption {
  /** Stable identity — what `value` holds and `onChange` reports. */
  readonly id: string;
  /** Display name, on the trigger and on the workspace's row. */
  readonly name: string;
  /**
   * The square avatar's letters. Derived from `name` when omitted: the
   * first letters of its first two words, or a one-word name's first two
   * letters — `Accounts Payable` reads `AP`, `Finance` reads `FI`.
   */
  readonly initials?: string;
  /**
   * Colour role of the square avatar. Give each workspace its own, so the
   * trigger says which one you are in at a glance.
   *
   * @default 'primary'
   */
  readonly color?: AvatarColor;
}

/** The words the switcher draws itself, for an app that is not in English. */
export interface WorkspaceSwitcherLabels {
  /** The label heading the list. @default 'Workspaces' */
  readonly heading: string;
  /** The row `onCreate` adds. @default 'Create workspace' */
  readonly create: string;
}

/** Props for the Neoflo `WorkspaceSwitcher`. */
export interface WorkspaceSwitcherProps {
  /** Every workspace the user can switch to, in the order the list shows them. */
  workspaces: readonly WorkspaceOption[];
  /**
   * The current workspace's `id`, for a switcher whose state you hold.
   * Pair it with `onChange`. Omit both and use `defaultValue` to let the
   * switcher hold it.
   */
  value?: string;
  /**
   * The workspace it starts on when it holds its own state.
   *
   * @default the first workspace
   */
  defaultValue?: string;
  /** Fired with the chosen workspace's `id` when the user picks one. */
  onChange?: (id: string) => void;
  /** Fired by the Create workspace row. Omit it to leave the row out. */
  onCreate?: () => void;
  /**
   * The folded rail: the trigger is the avatar alone on the rail's axis,
   * with the name in a tooltip. Pass the rail's own collapsed state.
   *
   * @default false
   */
  collapsed?: boolean;
  /** Replaces the words the switcher draws itself. Any subset; the rest stay English. */
  labels?: Partial<WorkspaceSwitcherLabels>;
}
