'use client';

import * as React from 'react';

import type { ListVariant } from './List.types';

/**
 * Which treatment the rows below a `List` take, and how deep they are.
 *
 * `variant` travels the way MUI's `dense` does — down through context, so
 * a row is styled by the list it is in rather than by a prop of its own.
 * `depth` counts nav lists inside nav lists: the top level is 0, and the
 * level under a parent row is 1, which is what draws the branch.
 */
export interface ListVariantContextValue {
  variant: ListVariant;
  depth: number;
}

export const ListVariantContext = React.createContext<ListVariantContextValue>(
  { variant: 'default', depth: 0 }
);
