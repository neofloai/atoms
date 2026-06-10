/**
 * Neoflo raw colour scales — the canonical source of truth.
 *
 * Each scale is a single mode (the designer's "Mode 1"). Light/dark
 * variations of *semantic* tokens (surface, border, text) live in
 * `./surface.ts`, `./border.ts`, and `./text.ts` and reference these
 * raw values — they should never hardcode hex.
 *
 * Scale names match the designer's Figma library exactly, including
 * `red` (not `error`) and `purple` (not `info`). The MUI palette role
 * mapping in `src/theme/palette.ts` translates these scales to the
 * `error`, `info`, etc. roles.
 *
 * Token files are intentionally framework-free: no React, no MUI
 * imports, no `'use client'`. Safe to read from Node scripts
 * (`scripts/generate.ts`).
 */

export const colors = {
  grey: {
    25: '#fefefd',
    50: '#fdfdfc',
    75: '#fafaf9',
    100: '#f5f5f3',
    200: '#ebeae8',
    300: '#cccac6',
    400: '#bcb8b0',
    500: '#938e83',
    600: '#848076',
    700: '#67635c',
    800: '#4a4742',
    900: '#2c2b27',
    1000: '#161614',
    1050: '#0f0f0e',
    1100: '#0b0b0a',
    1200: '#030303',
  },
  primary: {
    75: '#ebf1ff',
    100: '#d6e4ff',
    200: '#adc9ff',
    300: '#85adff',
    400: '#5c92ff',
    500: '#3377ff',
    600: '#014ce1',
    700: '#013db4',
    800: '#012e87',
    900: '#001e5a',
    1000: '#000f2d',
  },
  yellow: {
    25: '#fffdfa',
    50: '#fffcf5',
    75: '#fff9eb',
    100: '#fff3d6',
    200: '#ffe6ae',
    300: '#ffda85',
    400: '#fece5c',
    500: '#fec134',
    600: '#e5ae2f',
    700: '#b28724',
    800: '#7f611a',
    900: '#4c3a10',
    1000: '#191305',
    1100: '#0d0a03',
  },
  orange: {
    25: '#fffdfa',
    50: '#fffaf5',
    75: '#fff5eb',
    100: '#ffebd6',
    200: '#ffd6ae',
    300: '#ffc285',
    400: '#fead5c',
    500: '#fe9934',
    600: '#e58a2f',
    700: '#b26b24',
    800: '#7f4d1a',
    900: '#4c2e10',
    1000: '#190f05',
    1100: '#0d0803',
  },
  red: {
    25: '#fffafa',
    50: '#fff5f5',
    75: '#ffebeb',
    100: '#ffd7d8',
    200: '#ffafb1',
    300: '#ff888a',
    400: '#ff6063',
    500: '#ff383c',
    600: '#e53236',
    700: '#b2272a',
    800: '#801c1e',
    900: '#4d1112',
    1000: '#1a0606',
    1100: '#0d0303',
  },
  purple: {
    25: '#fbfbff',
    50: '#f7f7ff',
    75: '#f0efff',
    100: '#e1dfff',
    200: '#c3bfff',
    300: '#a69eff',
    400: '#887eff',
    500: '#6a5eff',
    600: '#5f55e5',
    700: '#4a42b2',
    800: '#352f80',
    900: '#201c4d',
    1000: '#0b091a',
    1100: '#06050d',
  },
  green: {
    25: '#fafdfb',
    50: '#f5fcf7',
    75: '#ebf9ef',
    100: '#d6f4de',
    200: '#aee9bd',
    300: '#85dd9b',
    400: '#5dd27a',
    500: '#34c759',
    600: '#2fb350',
    700: '#2a9f47',
    800: '#1f7735',
    900: '#155024',
    1000: '#0a2812',
    1100: '#051409',
  },
} as const;

export type ColorScale = keyof typeof colors;
export type ColorShade<S extends ColorScale> = keyof (typeof colors)[S];
export type ColorToken = (typeof colors)[ColorScale][keyof (typeof colors)[ColorScale]];
