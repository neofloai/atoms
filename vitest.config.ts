import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * Unit tests. Only the chat has them: its engine (the SSE reader, the
 * stream reducer, the runtime, persistence) is logic a docs page cannot
 * exercise, while the components are wrappers whose behaviour is MUI's and
 * whose look is checked in the browser on the docs site.
 *
 * `@/` resolves to the repo root, as it does for tsc, tsup and Next.
 */
export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL('./', import.meta.url)) }],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    setupFiles: ['test/chat/setup.ts'],
    restoreMocks: true,
    // The chat's UI tests stream whole answers through the mock backend in jsdom. Locally that is
    // 1-4s a test; CI's runners are slower and pushed two past the 5s default.
    testTimeout: 15_000,
    // The theme imports the self-hosted font CSS; let Vite handle it instead of Node.
    server: { deps: { inline: [/@fontsource/] } },
  },
});
