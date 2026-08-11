/**
 * Border-radius tokens.
 *
 * Per the design team, Figma does not define a *semantic* radius
 * layer (no `radius.sm / radius.md / radius.lg`). Designers apply
 * corner radius directly using values from the shared `Scale/*`
 * primitive collection (same one that backs spacing/gap).
 *
 * To give engineers a memorable named scale on top of those raw
 * primitives, this file exposes the same numeric ladder as `spacing`
 * (so both keep parity with Figma's `Scale/*`) plus a `full` token
 * for pill-shaped controls.
 *
 * Note that this ladder is *not* the same set as `spacing.component`
 * despite the shared names: `radius.lg` is 16 and there is no 16 on the
 * spacing ladder at all. That gap is why `Card` carries its 16px padding
 * as a literal rather than a token — see DESIGNER_QUESTIONS.md #31.
 *
 * Confirmed from Figma (node 953:3035):
 *   - card corner radius = 24px (Scale/400)  ->  `radius.xl`
 *
 * That line is contradicted by the Card component set (node 3648:24947,
 * read 11 August), where all eight symbols use `Scale/300` — 16px,
 * `radius.lg`. `Card` follows the component set, on the grounds that a
 * component sheet outranks a swatch board for that component's own
 * geometry. 953:3035 may well be a modal or a panel rather than a card;
 * both readings are recorded here until a designer settles it, and
 * neither number has been deleted from the ladder.
 *
 * Values are pixels.
 */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusTokens = typeof radius;
export type RadiusKey = keyof typeof radius;
