/**
 * Every environment variable the app reads, declared and checked once.
 *
 * Read `env` from here, never `import.meta.env` directly: a variable
 * that is only ever read in one component is one nobody knows the app
 * depends on until a deploy is missing it.
 */
function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true';
}

const apiUrl = import.meta.env.VITE_API_URL?.trim() ?? '';

export const env = {
  apiUrl,
  // No API configured means there is nothing to call, so mocks are the only option.
  useMocks: apiUrl === '' || readBoolean(import.meta.env.VITE_USE_MOCKS, false),
  isDev: import.meta.env.DEV,
} as const;
