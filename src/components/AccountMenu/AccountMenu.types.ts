import type * as React from 'react';

import type { AvatarColor } from '../Avatar';

/** The signed-in user the menu belongs to. */
export interface AccountMenuUser {
  /** Full name — the header's first line, and where the initials come from. */
  readonly name: string;
  /** Sign-in address, under the name in caption ink. Omit to leave the line out. */
  readonly email?: string;
  /** Role or plan — `Tenant Owner`, `Admin` — as a small grey tag under the address. */
  readonly role?: string;
  /**
   * The avatar's letters. Derived from `name` when omitted: the first
   * letter of the first and last words, so `John Doe` reads `JD`.
   */
  readonly initials?: string;
  /** A photo for the avatar. The initials show when it is omitted or fails to load. */
  readonly avatarSrc?: string;
}

/** The words the menu draws itself, for an app that is not in English. */
export interface AccountMenuLabels {
  /** The trigger's accessible name. @default 'Account' */
  readonly trigger: string;
  /** The theme row's label, and the switch's accessible name. @default 'Theme' */
  readonly theme: string;
  /** @default 'System' */
  readonly system: string;
  /** @default 'Light' */
  readonly light: string;
  /** @default 'Dark' */
  readonly dark: string;
  /** @default 'Sign out' */
  readonly signOut: string;
}

/** Props for the Neoflo `AccountMenu`. */
export interface AccountMenuProps {
  /** The signed-in user: the avatar on the trigger, and the panel's header. */
  user: AccountMenuUser;
  /**
   * The rows between the header and the theme switch — `MenuItem`s, with a
   * `Divider` between groups. Choosing a row closes the menu, so a row's
   * `onClick` only does its own work. Pass the rows themselves, not a
   * `Fragment` around them: a menu reads its options as direct children.
   */
  children?: React.ReactNode;
  /** Fired by the Sign out row, which closes the menu as it does. Omit it to leave Sign out out. */
  onSignOut?: () => void;
  /**
   * Show the System / Light / Dark switch on a row of its own. It is wired
   * to `NeofloThemeProvider`'s colour scheme, so it needs nothing else.
   *
   * @default true
   */
  showThemeSwitch?: boolean;
  /**
   * Colour role of the avatar, on the trigger and in the header.
   *
   * @default 'error'
   */
  avatarColor?: AvatarColor;
  /** Replaces the words the menu draws itself. Any subset; the rest stay English. */
  labels?: Partial<AccountMenuLabels>;
}
