/**
 * Shapes of the auto-generated `data/*.json` manifests consumed by the
 * MCP tools. These mirror what `scripts/generate.ts` writes — if the
 * generator output changes, update these types in the same commit.
 */

export interface ComponentProp {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface ComponentExample {
  title: string;
  code: string;
}

export interface ComponentData {
  name: string;
  category: string;
  tagline: string;
  figmaUrl?: string;
  props: ComponentProp[];
  examples: ComponentExample[];
  dos: string[];
  donts: string[];
}

export interface PatternData {
  name: string;
  slug: string;
  description: string;
  code: string;
}

export interface ComponentManifest {
  generatedAt: string;
  components: ComponentData[];
}

export interface TokenManifest {
  generatedAt: string;
  tokens: Record<string, unknown>;
}

export interface PatternManifest {
  generatedAt: string;
  patterns: PatternData[];
}
