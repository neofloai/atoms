'use client';

import * as React from 'react';

/**
 * Bar-level defaults passed down to every child `Tab`.
 *
 * Only `disabled` travels this way, and it has to: MUI's `Tabs` clones
 * its children to inject `value` / `selected` / `onChange` / `indicator`,
 * but it has no bar-level `disabled` of its own to forward — unlike
 * `ToggleButtonGroup`, which does. The Figma component set draws the
 * whole row disabled (node 3463:12630, `enabled=False`), so the prop
 * belongs on the bar and this is the only way to get it to the tabs.
 *
 * Internal — not exported from the package. Consumers set `disabled` on
 * `Tabs` and never see the context.
 */
export interface TabsContextValue {
  disabled?: boolean;
}

export const TabsContext = React.createContext<TabsContextValue>({});
