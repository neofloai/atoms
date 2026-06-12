import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    icons: 'src/icons/index.ts',
    tokens: 'src/tokens/index.ts',
    theme: 'src/theme/index.ts',
  },
  format: ['esm', 'cjs'],
  tsconfig: 'tsconfig.lib.json',
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    '@emotion/cache',
    '@mui/material-nextjs',
    '@phosphor-icons/react',
  ],
  treeshake: true,
  outDir: 'dist',
});
