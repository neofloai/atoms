/**
 * Every route the app has, as data.
 *
 * In shared rather than app because pages and features link to routes,
 * and neither may import from app. Link with these, never a string
 * literal, so renaming a route is one edit.
 */
export const paths = {
  home: '/',
  invoices: '/invoices',
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];
