/**
 * Contract for `<Name>.examples.tsx` files in `src/components/`.
 *
 * The generator (`scripts/generate.ts`) imports each examples file and
 * writes this shape into `data/components.json`, which both the docs
 * site and the MCP `get_component` / `list_components` tools consume.
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
  props: ComponentPropDoc[];
  examples: ComponentExampleDoc[];
  dos: string[];
  donts: string[];
  relatedComponents?: string[];
  accessibility?: string[];
}
