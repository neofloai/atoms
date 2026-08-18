'use client';

import * as React from 'react';

import { SnackbarContext } from './SnackbarProvider';

import type { SnackbarApi } from './Snackbar.types';

/**
 * Fire a toast from anywhere below a `SnackbarProvider`.
 *
 * `success`, `error`, `warning` and `info` take a message and nothing
 * else; `notify` takes the whole thing when the message needs a title, an
 * action, or a dismiss delay of its own; `dismiss` takes the current one
 * down early.
 *
 * Feedback is fired from an event handler rather than rendered from
 * state, and that is what this replaces: a `useState` pair and a
 * `<Snackbar>` at every call site that reports anything, each one wired
 * slightly differently.
 *
 * Throws outside a provider rather than doing nothing. A toast that
 * silently never appears is the hardest kind of missing — the save looks
 * broken, and the save is fine.
 *
 * @example
 * const { success, error } = useSnackbar();
 *
 * async function handleSave() {
 *   try {
 *     await save(draft);
 *     success('Changes saved.');
 *   } catch (cause) {
 *     console.error('Save failed:', cause);
 *     error('Could not save your changes.');
 *   }
 * }
 *
 * @example A message that waits to be read
 * const { notify } = useSnackbar();
 *
 * notify({
 *   severity: 'error',
 *   title: 'Upload failed',
 *   message: 'The file was larger than the 25 MB limit.',
 *   autoHideDuration: null,
 * });
 *
 * @see Related: SnackbarProvider, which has to be above this in the tree.
 */
export function useSnackbar(): SnackbarApi {
  const api = React.useContext(SnackbarContext);
  if (api === null) {
    throw new Error(
      'useSnackbar was called outside a SnackbarProvider. Wrap the app in <SnackbarProvider>, inside NeofloThemeProvider.'
    );
  }
  return api;
}
