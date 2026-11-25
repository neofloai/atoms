import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Everywhere in the chat: Atoms internals by their own module, never MUI or
 * a public barrel. Exact module names go in `paths` — a `patterns` entry is
 * gitignore-style, so `@/src/icons` there would also forbid
 * `@/src/icons/glyphs`, the one path that is right.
 */
const CHAT_PATHS = [
  ...["@/src/icons", "@/src/icons/index"].map((name) => ({
    name,
    message: "Import glyphs from `@/src/icons/glyphs` — the icon barrel pins all 1,500 icons. See src/icons/glyphs.ts.",
  })),
  ...["@/src", "@/src/index", "@neofloai/atoms"].map((name) => ({
    name,
    message: "Import the component's own module (`@/src/components/<Name>`), not a public barrel.",
  })),
];
const CHAT_RESTRICTED = [
  {
    group: ["@mui/*", "@emotion/*"],
    message: "The chat builds on Atoms components (`@/src/components/<Name>`), never on MUI directly.",
  },
  {
    group: ["@neofloai/atoms/*"],
    message: "Import the Atoms module by path (`@/src/...`), not the package's own public entry.",
  },
];
const NO_RECHARTS = [
  { group: ["recharts"], message: "Recharts belongs to `src/chat/charts/` only (`@neofloai/atoms/chat/charts`)." },
];
const NO_STYLED = [
  {
    group: [
      "@/src/components/*",
      "@/src/icons/*",
      "@/src/theme",
      "@/src/theme/*",
      "@/src/tokens",
      "@/src/tokens/*",
      "react-markdown",
      "remark-gfm",
    ],
    message: "The headless layer stays free of styling; the styled UI lives in `src/chat/ui/`.",
  },
];
const NO_REACT = [
  {
    group: ["react", "react-dom", "react/*", "@radix-ui/*"],
    message: "`/chat/core` and `/chat/mock` are framework-free so server code can import them.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated library build output (tsup).
    "dist/**",
    // Atoms Inspector extension build output.
    "extension/dist/**",
    // App templates carry their own tsconfig and oxlint config.
    "templates/**",
  ]),
  {
    // Atoms Studio is a Chrome extension page, not a Next app: next/image does not exist there.
    files: ["extension/**"],
    rules: { "@next/next/no-img-element": "off" },
  },

  // ── The chat (`src/chat/`) ──────────────────────────────────────────
  //
  // Its layers are what keep each `@neofloai/atoms/chat*` subpath from
  // importing more than it needs, so the boundaries are enforced here
  // rather than trusted. Flat config does not merge `no-restricted-imports`
  // across blocks — the last matching block wins — so each block below
  // repeats the patterns of the one before it and adds its own.
  {
    files: ["src/chat/**", "test/chat/**"],
    rules: {
      // The React Compiler rules flag the latest-value ref
      // (`ref.current = prop` during render) that the store hooks and the
      // provider are built on, deliberately: it keeps `useSyncExternalStore`
      // selectors and callbacks stable without re-subscribing. The chat is
      // not built with the compiler, and these are the rules it shipped
      // under before it moved into Atoms.
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "no-restricted-imports": ["error", { paths: CHAT_PATHS, patterns: CHAT_RESTRICTED }],
    },
  },
  {
    // The styled UI may use Atoms components, react-markdown and the Slot,
    // never Recharts: charts live in `/chat/charts` so a chat without them
    // never resolves it.
    files: ["src/chat/ui/**", "src/chat/index.ts"],
    rules: {
      "no-restricted-imports": ["error", { paths: CHAT_PATHS, patterns: [...CHAT_RESTRICTED, ...NO_RECHARTS] }],
    },
  },
  {
    // The headless layer: no components, icons, theme, tokens, Markdown or
    // Recharts, so a custom chat built on the hooks and primitives
    // tree-shakes the styled UI away.
    files: [
      "src/chat/react/**",
      "src/chat/registry/**",
      "src/chat/blocks/**",
      "src/chat/headless.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", { paths: CHAT_PATHS, patterns: [...CHAT_RESTRICTED, ...NO_RECHARTS, ...NO_STYLED] }],
    },
  },
  {
    // `/chat/core` and `/chat/mock` have no React at all, so server code —
    // a route handler, a server action — can import them.
    files: ["src/chat/core/**", "src/chat/mock/**", "src/chat/core.ts", "src/chat/mock.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: CHAT_PATHS, patterns: [...CHAT_RESTRICTED, ...NO_RECHARTS, ...NO_STYLED, ...NO_REACT] },
      ],
    },
  },
]);

export default eslintConfig;
