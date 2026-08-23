/**
 * Shapes of the auto-generated `data/*.json` manifests consumed by the
 * MCP tools. These mirror what `scripts/generate.ts` writes — if the
 * generator output changes, update these types in the same commit.
 */

import type { BrandGuide } from '@/src/brand/branding';
import type { InstallationGuide } from '@/src/install';
import type { ProjectGuide } from '@/src/project/types';
import type { ReleaseGuide } from '@/src/release/types';

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
  /**
   * Extra search terms, so `search_docs` reaches a component through the
   * everyday name for it rather than only the house one. Optional because
   * the docs contract makes it optional; set where the house name is not
   * what anyone would type — see `Drawer` and `Navbar`.
   */
  keywords?: readonly string[];
  figmaUrl?: string;
  props: ComponentProp[];
  examples: ComponentExample[];
  dos: string[];
  donts: string[];
  /**
   * Components worth comparing before committing to this one. Optional
   * because the docs contract makes it optional, though every published
   * component sets it.
   *
   * Served by `get_component` rather than held back for the docs site:
   * picking the wrong component is a decision made before the props are
   * read, so the alternatives have to travel with the spec.
   */
  relatedComponents?: string[];
}

export interface PatternData {
  name: string;
  slug: string;
  description: string;
  code: string;
  /** Atoms components the pattern is built from. */
  components: string[];
  dos: string[];
  donts: string[];
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

export type InstallationManifest = InstallationGuide & {
  generatedAt: string;
};

export type ProjectManifest = ProjectGuide & {
  generatedAt: string;
};

export type ReleaseManifest = ReleaseGuide & {
  generatedAt: string;
};

export interface BrandManifest {
  generatedAt: string;
  brand: BrandGuide;
}
