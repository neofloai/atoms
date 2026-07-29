/**
 * Neoflo raw colour scales — the canonical source of truth.
 *
 * Each scale is a single mode (the designer's "Mode 1"). Light/dark
 * variations of *semantic* tokens (surface, border, text, icon) live in
 * `./surface.ts`, `./border.ts`, `./icon.ts`, and `./text.ts` and
 * reference these raw values — they should never hardcode hex.
 *
 * Scale names match the designer's Figma library exactly, including
 * `red` (not `error`) and `blue` (not `info`). `purple` is a
 * standalone raw scale not currently used by any semantic token. The MUI
 * palette role mapping in `src/theme/palette.ts` translates these scales
 * to the `error`, `info`, etc. roles.
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
    125: '#f7f7f6',
    150: '#eeeeec',
    200: '#e5e4e1',
    300: '#cccac6',
    400: '#bfbcb7',
    500: '#aeaba4',
    600: '#a3a19b',
    625: '#848280',
    650: '#6d6b68',
    700: '#43403c',
    800: '#31302e',
    900: '#242421',
    950: '#1c1c1a',
    1000: '#171716',
    1050: '#121211',
    1075: '#0f0f0d',
    1100: '#0d0d0c',
    1200: '#030303',
  },
  primary: {
    25: '#f9f9fc',
    50: '#f3f4fb',
    75: '#e9ebfa',
    100: '#d5d8f7',
    200: '#aeb3f3',
    300: '#868fee',
    400: '#5f6aea',
    500: '#4961dc',
    600: '#343eb3',
    700: '#262f8e',
    800: '#1e2363',
    900: '#151837',
    1000: '#111322',
    1100: '#0f1017',
  },
  blue: {
    25: '#f9fafc',
    50: '#f2f5fb',
    75: '#e7ecfa',
    100: '#d1dcf9',
    200: '#a4baf6',
    300: '#7899f2',
    400: '#4c77ef',
    500: '#1f56ec',
    600: '#1c47bf',
    700: '#183992',
    800: '#142a66',
    900: '#111c39',
    1000: '#0f1422',
    1100: '#0e1117',
  },
  red: {
    25: '#fcf8f9',
    50: '#faf0f4',
    75: '#f7e4ec',
    100: '#f1cadd',
    200: '#e598be',
    300: '#d8659e',
    400: '#cc337f',
    500: '#c00060',
    600: '#9c034f',
    700: '#78053e',
    800: '#55082e',
    900: '#430925',
    1000: '#310a1d',
    1100: '#1f0c14',
  },
  yellow: {
    25: '#fdfcf8',
    50: '#fdfbf2',
    75: '#fdf9e8',
    100: '#fdf4d4',
    200: '#fdecac',
    300: '#fee384',
    400: '#fedb5c',
    500: '#fed234',
    600: '#ceab2c',
    700: '#9e8324',
    800: '#6d5c1c',
    900: '#3d3414',
    1000: '#252110',
    1100: '#19170e',
  },
  orange: {
    25: '#fdfbf8',
    50: '#fdf8f2',
    75: '#fdf3e8',
    100: '#fde9d4',
    200: '#fdd5ac',
    300: '#fec184',
    400: '#fead5c',
    500: '#fe9934',
    600: '#ce7d2c',
    700: '#9e6124',
    800: '#6d451c',
    900: '#3d2914',
    1000: '#251b10',
    1100: '#19140e',
  },
  purple: {
    25: '#fbfafc',
    50: '#f7f5fc',
    75: '#f1edfc',
    100: '#e4ddfd',
    200: '#cbbdfd',
    300: '#b39efe',
    400: '#9a7efe',
    500: '#815eff',
    600: '#6a4ece',
    700: '#533e9e',
    800: '#3b2d6d',
    900: '#241d3d',
    1000: '#191524',
    1100: '#131118',
  },
  green: {
    25: '#f8faf8',
    50: '#ebf4f0',
    75: '#cbe1d7',
    100: '#b1d2c4',
    200: '#98c4b2',
    300: '#66a88d',
    400: '#338b68',
    500: '#016f43',
    600: '#035b38',
    700: '#073e28',
    800: '#092a1d',
    900: '#0b2117',
    1000: '#0c1712',
    1100: '#0c120f',
  },
} as const;

export type ColorScale = keyof typeof colors;
export type ColorShade<S extends ColorScale> = keyof (typeof colors)[S];
export type ColorToken = (typeof colors)[ColorScale][keyof (typeof colors)[ColorScale]];
