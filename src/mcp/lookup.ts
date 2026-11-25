import type { ComponentData } from './types';

/**
 * How the MCP tools match what a caller typed against what Atoms calls
 * things.
 *
 * Two tools need it and both used to get it wrong in the same way. An
 * agent asks with the user's words, not the house names: "navbar sidebar",
 * "account dropdown", `get_component("Sidebar")`. `search_docs` matched the
 * whole query as one substring, so any query of two words that never sat
 * side by side in one component's text found nothing at all; and
 * `get_component` matched the name exactly and case-sensitively, so
 * "Sidebar" — the most common word for the component a screen starts with
 * — came back "not found" with no pointer to `Drawer`.
 *
 * So a query is matched term by term and ranked, and a name is resolved
 * through the curated `keywords` every component carries for exactly this.
 */

/** Words that say nothing about which thing is meant. */
const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'atoms',
  'build',
  'can',
  'component',
  'components',
  'do',
  'does',
  'for',
  'get',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'mui',
  'my',
  'need',
  'neoflo',
  'of',
  'on',
  'or',
  'our',
  'show',
  'the',
  'to',
  'use',
  'want',
  'we',
  'what',
  'where',
  'which',
  'with',
  'you',
  'your',
]);

/** Lower case, with every run of whitespace a single space. */
export function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Lower case with everything but letters and digits removed, so `side bar`,
 * `side-bar`, `SideBar` and `sidebar` are one string — and `navbar` is
 * found in `Navbar` and in `nav bar` alike.
 */
export function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** The query's words, minus the ones that name nothing. */
export function termsOf(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);
  const meaningful = words.filter((word) => !STOPWORDS.has(word));
  return [...new Set(meaningful.length > 0 ? meaningful : words)];
}

/** A term and its singular, so `menus` finds `menu` and `sidebars` finds `sidebar`. */
function variantsOf(term: string): string[] {
  if (term.length > 4 && term.endsWith('es')) return [term, term.slice(0, -2), term.slice(0, -1)];
  if (term.length > 3 && term.endsWith('s')) return [term, term.slice(0, -1)];
  return [term];
}

/** Anything a query can be ranked against. */
export interface Searchable {
  /** The house name — `Drawer`, `dashboard`, `spacing`. */
  readonly name: string;
  /** The everyday names for it, curated rather than derived. */
  readonly keywords: readonly string[];
  /** The one line that says what it is for. */
  readonly summary: string;
  /** Everything else worth matching, weakly — prop docs, a section's prose. */
  readonly body?: string;
}

/**
 * The lowest score worth showing: a term found in a summary at least.
 * A term found only in the body is a mention in passing, and is shown only
 * when nothing better matched.
 */
export const STRONG_MATCH = 3;

/**
 * How well `query` describes `item`. Zero means no term matched.
 *
 * The whole query counts most — it is the house name, or one of the
 * curated keywords, or a substring of the name. Then each term counts on
 * its own, by where it landed: the name, a keyword, the summary, the body.
 * An item that matched every term of a several-term query gets a bonus,
 * so "workspace switcher" puts `WorkspaceSwitcher` above `Menu` even
 * though both mention a workspace — but a query whose terms name two
 * different things ("navbar sidebar") still finds both of them.
 */
export function scoreMatch(query: string, item: Searchable): number {
  const phrase = normalize(query);
  const phraseCompact = compact(query);
  if (phraseCompact.length === 0) return 0;

  const name = compact(item.name);
  const keywords = item.keywords.map(normalize);
  const keywordsCompact = item.keywords.map(compact);
  const summary = normalize(item.summary);
  const summaryCompact = compact(item.summary);
  const body = item.body ? compact(item.body) : '';

  let score = 0;
  if (phraseCompact === name) score += 100;
  else if (keywordsCompact.includes(phraseCompact)) score += 60;
  else if (phraseCompact.length >= 4 && name.includes(phraseCompact)) score += 40;
  else if (keywords.some((keyword) => keyword.includes(phrase))) score += 30;
  else if (summary.includes(phrase)) score += 15;

  const terms = termsOf(query);
  let matched = 0;
  for (const term of terms) {
    const variants = variantsOf(term);
    const found = (haystack: string): boolean =>
      variants.some((variant) => haystack.includes(variant));
    let termScore = 0;
    if (found(name)) termScore = 12;
    else if (keywordsCompact.some(found)) termScore = 8;
    else if (found(summaryCompact)) termScore = 3;
    else if (body && found(body)) termScore = 1;
    if (termScore > 0) matched += 1;
    score += termScore;
  }
  if (terms.length > 1 && matched === terms.length) score += 10 * terms.length;

  return score;
}

/** True when every term of the query appears somewhere in `text`. */
export function matchesEveryTerm(query: string, text: string): boolean {
  const haystack = compact(text);
  const phrase = compact(query);
  if (phrase.length > 0 && haystack.includes(phrase)) return true;
  const terms = termsOf(query);
  return (
    terms.length > 0 &&
    terms.every((term) => variantsOf(term).some((variant) => haystack.includes(variant)))
  );
}

/** A component as `scoreMatch` reads it. */
export function componentSearchable(component: ComponentData): Searchable {
  return {
    name: component.name,
    keywords: component.keywords ?? [],
    summary: `${component.category} ${component.tagline}`,
    body: component.props.map((prop) => `${prop.name} ${prop.description}`).join(' '),
  };
}

/** What a component name a caller passed turned out to mean. */
export interface ComponentResolution {
  /** The component, when the name settled on exactly one. */
  readonly component?: ComponentData;
  /**
   * How it settled: `exact`, the house name in any case or spacing
   * (`navbar`, `account-menu`), or one of its everyday names (`sidebar`).
   */
  readonly via?: 'exact' | 'name' | 'keyword';
  /** The components it could mean, when it did not settle on one. */
  readonly candidates: readonly ComponentData[];
}

/**
 * Resolves a name to a component: exactly, then ignoring case and
 * separators, then through the curated keywords — so `Sidebar` is
 * `Drawer` and `topbar` is `Navbar`. A keyword two components share
 * (`shell`) settles on neither and returns both; a name that is no
 * keyword at all returns the closest matches instead.
 */
export function resolveComponent(
  name: string,
  components: readonly ComponentData[]
): ComponentResolution {
  const exact = components.find((component) => component.name === name);
  if (exact) return { component: exact, via: 'exact', candidates: [] };

  const wanted = compact(name);
  const byName = components.find((component) => compact(component.name) === wanted);
  if (byName) return { component: byName, via: 'name', candidates: [] };

  const byKeyword = components.filter((component) =>
    (component.keywords ?? []).some((keyword) => compact(keyword) === wanted)
  );
  if (byKeyword.length === 1) {
    return { component: byKeyword[0], via: 'keyword', candidates: [] };
  }
  if (byKeyword.length > 1) return { candidates: byKeyword };

  const ranked = components
    .map((component) => ({ component, score: scoreMatch(name, componentSearchable(component)) }))
    .filter((entry) => entry.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.component);
  return { candidates: ranked };
}
