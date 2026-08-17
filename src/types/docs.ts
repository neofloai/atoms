/**
 * Contracts for the docs data files: `<Name>.examples.tsx` in
 * `src/components/`, and `<slug>.examples.ts` in `src/patterns/`.
 *
 * The generator (`scripts/generate.ts`) imports each one and writes this
 * shape into `data/components.json` / `data/patterns.json`, which both
 * the docs site and the MCP `get_component` / `list_components` /
 * `get_pattern` tools consume.
 */

export interface ComponentPropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface ComponentExampleDoc {
  title: string;
  description?: string;
  code: string;
}

export interface ComponentExamplesData {
  name: string;
  category: string;
  tagline: string;
  /** Source design in the Product Design System Figma file. */
  figmaUrl?: string;
  props: ComponentPropDoc[];
  examples: ComponentExampleDoc[];
  dos: string[];
  donts: string[];
  relatedComponents?: string[];
}

/**
 * Contract for a page layout pattern in `src/patterns/`.
 *
 * A pattern is a whole screen rather than a component: it ships no
 * runtime export, only the arrangement of components that make one, so
 * `code` is the deliverable and there are no props to document. The docs
 * page and the MCP `get_pattern` tool read the same object, which is
 * what keeps a copied snippet and a served one the same snippet.
 */
export interface PatternExamplesData {
  /** Display name — `Dashboard`. */
  name: string;
  /** URL and MCP lookup key — `dashboard`. Matches the docs route. */
  slug: string;
  /** One line on what the screen is for. Also the search summary. */
  description: string;
  /**
   * The page, end to end, as tsx. Long on purpose: an agent asking for a
   * pattern wants a file it can paste, not a fragment.
   */
  code: string;
  /**
   * Atoms components the pattern is built from, in the order the page
   * introduces them. Tells a reader — and an agent deciding which
   * `get_component` calls to make — what to know before starting.
   */
  components: string[];
  dos: string[];
  donts: string[];
}
