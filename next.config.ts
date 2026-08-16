import type { NextConfig } from "next";

/**
 * Sent as `X-Robots-Tag` on every response.
 *
 * robots.txt asks a crawler not to fetch; this tells anything that
 * fetched anyway not to keep what it got. The header (rather than only
 * the `<meta>` tag in the root layout) is what covers the parts of the
 * site that are not HTML -- images under /public, the JSON the MCP
 * endpoint returns, the static chunks -- since a meta tag cannot exist
 * in any of those.
 *
 * `noai` and `noimageai` are not part of the robots standard. They are
 * a convention some AI crawlers have adopted, cost nothing to send, and
 * are ignored by everything else.
 */
const ROBOTS_TAG = [
  "noindex",
  "nofollow",
  "noarchive",
  "nosnippet",
  "noimageindex",
  "nocache",
  "notranslate",
  "noai",
  "noimageai",
].join(", ");

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) so the
  // production Docker image ships only the traced runtime files instead
  // of the full node_modules tree.
  output: "standalone",

  async headers() {
    return [
      {
        // `:path*` matches zero or more segments, so this covers "/"
        // and every asset below it, not just the page routes.
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: ROBOTS_TAG },
          // Keep the hostname out of other people's referrer logs and
          // analytics when someone follows a link off the docs. Those
          // logs are a real way an internal domain gets discovered.
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
