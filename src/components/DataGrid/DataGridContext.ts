'use client';

import * as React from 'react';

/** What the wrapper tells the slots it swaps into the grid. */
export interface DataGridContextValue {
  /** The noun the pagination strip counts in. */
  rowNoun: string;
}

/**
 * How a Neoflo prop reaches a part of the grid that MUI renders.
 *
 * The pieces this component replaces — the pagination strip, the skeleton
 * bar — are `slots`, and a slot is instantiated by the grid rather than by
 * the wrapper, so a prop cannot simply be passed to it. MUI's own channel
 * for this is `slotProps`, and it is the wrong one here: `slotProps` is
 * typed from the *default* slot's props, so `rowNoun` would not
 * type-check without augmenting `GridSlotProps` — a module-level
 * declaration that would land in every consumer's project whether they
 * use a grid or not.
 *
 * Context costs nothing, stays typed, and leaves `slotProps` free for the
 * caller. `Table` passes its `size` down the same way and for a related
 * reason.
 */
export const DataGridContext = React.createContext<DataGridContextValue>({
  rowNoun: 'rows',
});

export function useDataGridContext(): DataGridContextValue {
  return React.useContext(DataGridContext);
}
