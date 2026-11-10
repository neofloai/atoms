/// <reference types="vite/client" />

// Declare each variable here as well as in src/shared/config/env.ts.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
