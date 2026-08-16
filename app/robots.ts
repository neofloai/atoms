import type { MetadataRoute } from 'next';

/**
 * Crawlers named individually in robots.txt.
 *
 * Grouped by who runs them so the list stays auditable: when a bot
 * turns up in the access logs, the question is always "is it in here,
 * and under whose name".
 */
const NAMED_CRAWLERS: readonly string[] = [
  // OpenAI
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  // Anthropic
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'Claude-Web',
  // Google and Apple. Neither token has a crawler behind it -- they are
  // the AI-training opt-outs for bots that already crawl under another
  // name, and they are only ever honoured when named explicitly.
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  // Meta
  'meta-externalagent',
  'meta-externalfetcher',
  'FacebookBot',
  // Answer engines and assistants
  'PerplexityBot',
  'Perplexity-User',
  'MistralAI-User',
  'DuckAssistBot',
  'YouBot',
  'Amazonbot',
  'Bytespider',
  'PanguBot',
  // Bulk corpus builders and scraping services
  'CCBot',
  'AI2Bot',
  'Ai2Bot-Dolma',
  'cohere-ai',
  'cohere-training-data-crawler',
  'Diffbot',
  'Omgilibot',
  'Omgili',
  'Webzio-Extended',
  'Timpibot',
  'ImagesiftBot',
  'FirecrawlAgent',
  'Scrapy',
  // SEO link indexes. Not search engines, but they republish every URL
  // they find, which is its own discovery path.
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'DataForSeoBot',
];

/**
 * robots.txt for atoms.neoflo.ai.
 *
 * Atoms is internal. Nothing here should be discoverable -- no search
 * result, no AI answer, no training corpus -- so every crawler is
 * disallowed from the whole site. There is deliberately no sitemap.
 *
 * `User-agent: *` alone would cover every bot that parses robots.txt to
 * spec, since a crawler only falls back to the wildcard when no group
 * names it. The named groups are still worth their length:
 *
 *   1. Several AI vendors read `*` as a rule about *search* crawling
 *      and honour their own token for training. `Google-Extended` and
 *      `Applebot-Extended` exist for nothing else.
 *   2. A group that names the agent beats `*`, so these survive anyone
 *      later loosening the wildcard for a preview tool or an uptime
 *      checker.
 *   3. It makes the block auditable -- diff the list against the logs
 *      and you know exactly who ignored it.
 *
 * This file is a request, not a control. It stops the crawlers that
 * choose to be stopped; it is paired with `X-Robots-Tag: noindex` on
 * every response (see `next.config.ts`) for the ones that crawl anyway,
 * and neither is access control. See DEPLOYMENT.md for that.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', disallow: '/' },
      { userAgent: [...NAMED_CRAWLERS], disallow: '/' },
    ],
  };
}
