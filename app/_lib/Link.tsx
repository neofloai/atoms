'use client';

import NextLink from 'next/link';
import type { LinkProps } from 'next/link';

/**
 * Client-boundary wrapper around `next/link`.
 *
 * Next.js 16 forbids passing a server-imported function reference into
 * a Client Component prop. Material UI's `component` (and the `Link`'s
 * `component` slot specifically) treats whatever we pass as a function
 * reference, which trips that check whenever the page is a server
 * component.
 *
 * Marking this module `'use client'` and re-exporting `next/link`
 * routes the reference through the client manifest, so MUI receives a
 * valid client function. This is the pattern recommended by Material
 * UI's official Next.js integration docs for MUI v9 + Next.js v16.
 *
 * Docs-site internal only — not part of the `@neofloai/atoms` public
 * package.
 */
export default NextLink;
export type { LinkProps };
