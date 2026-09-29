/**
 * The `atoms-screen` handover format, shared by the inspector (which
 * writes it) and Atoms Studio (which renders, edits and re-exports it).
 *
 * Version 2 adds what a renderer needs to rebuild the screen faithfully —
 * each style's raw CSS, the `sx` object as written, element attributes —
 * and what Studio adds on top: notes, deviation resolutions, component
 * token overrides and the list of edits. Version 1 files still load.
 */

export const HANDOVER_FORMAT = 'atoms-screen';
export const HANDOVER_FORMAT_VERSION = 2;

/** The readme's second line: the Atoms MCP turns the file into code. Studio adds it to files written before it. */
export const BUILD_LINE =
  'Call build_from_json on the Atoms MCP with this whole file: it returns the React code, the components to look up, what to wire and the gaps. The lines below are what it reads, for building by hand.';

/**
 * `sx` keys that restyle a component rather than place it. An `sx` entry
 * with one of these keys (or any nested selector) on a component is a
 * deviation; `width`, `flex`, margins and the like only place it.
 */
export const VISUAL_KEY =
  /^(p|px|py|pt|pr|pb|pl|padding.*|bgcolor|background.*|color|border.*|outline.*|boxShadow|typography|font.*|lineHeight|letterSpacing|textTransform|textDecoration.*|opacity|fill|stroke|gap|rowGap|columnGap)$/;

/** `[x, y, width, height]` in CSS pixels, relative to the exported area's top-left corner. */
export type Rect = [number, number, number, number];

/** A style value matched to a token. `off` when no token carries it. */
export interface StyleValue {
  /** What to show: `12px`, `#4949dc`, `14 / 20`. */
  value: string;
  token?: string;
  /** Several tokens share this value and nothing declared which one was meant. */
  candidates?: string[];
  off?: true;
  note?: string;
  /** The CSS declarations behind it, as rendered (`{ 'padding-top': '14px' }`). */
  css?: Record<string, string>;
}

export interface Layout {
  display: string;
  direction?: string;
  align?: string;
  justify?: string;
  wrap?: string;
  columns?: string;
}

interface NodeBase {
  id: string;
  rect: Rect;
  /** The pattern region this node is, when the page marks one (`toolbar`). */
  region?: string;
  children?: HandoverNode[];
  /** A note for the developer, written in Studio. */
  note?: string;
}

export interface ComponentNode extends NodeBase {
  kind: 'component';
  name: string;
  /** The props the design passed, except `children`, `sx` and `style`. */
  props: Record<string, unknown>;
  text?: string;
  /** The `sx` object as written. Restyling entries are listed under `deviations` too. */
  sx?: unknown;
  style?: Record<string, string>;
  /** Set when the component was drawn by another one's own code (a table's cell renderer), not placed directly. */
  renderedBy?: string;
  /** Colour tokens the component declared for itself, by CSS property. */
  tokens?: Record<string, string>;
  /** A data grid's cells as they read on screen, by row id then field — what its cell renderers produced. */
  cells?: Record<string, Record<string, string>>;
  /** For a component a grid's cell renderer drew: the cell it sits in. */
  cell?: { row: string; field: string };
  /**
   * Changed in Studio outside the component's props. The key is the property (`height`, `padding-inline`,
   * `type`, `icon-size`, `border-color`…), optionally after a selector for a part inside the component
   * (`.MuiInputBase-input type`); the value is a token path, or pixels for sizes. Always a deviation.
   */
  overrides?: Record<string, string>;
}

export interface LayoutNode extends NodeBase {
  kind: 'layout';
  name: string;
  props: Record<string, unknown>;
  layout?: Layout;
  styles?: Record<string, StyleValue>;
  sx?: unknown;
}

export interface ElementNode extends NodeBase {
  kind: 'element';
  tag: string;
  text?: string;
  layout?: Layout;
  styles?: Record<string, StyleValue>;
  /** Sizing and placement the renderer needs (`flex-grow`, `align-self`, `width` of an image). */
  box?: Record<string, string>;
  /** `src`, `alt`, `href`, `placeholder`, and an inline SVG's markup. */
  attrs?: Record<string, string>;
}

export interface IconNode {
  kind: 'icon';
  id: string;
  name: string;
  props: Record<string, unknown>;
  rect: Rect;
  note?: string;
}

export interface TextNode {
  kind: 'text';
  /** Given by Studio; absent in files straight from the inspector. */
  id?: string;
  text: string;
}

export interface RepeatNode {
  kind: 'repeat';
  id?: string;
  /** How many siblings share this shape. */
  count: number;
  /** The first few, in full — sample content, not the whole list. */
  items: HandoverNode[];
}

export type HandoverNode = ComponentNode | LayoutNode | ElementNode | IconNode | TextNode | RepeatNode;

export interface Deviation {
  kind: 'sx' | 'style' | 'drift' | 'off-token' | 'override';
  /** The `id`s of the nodes it appears on — identical deviations are listed once. */
  nodes: string[];
  component?: string;
  property: string;
  value: string;
  note?: string;
  /** What the designer decided in Studio. */
  resolution?: { status: 'fixed' | 'accepted'; note?: string };
}

export interface Edit {
  node: string;
  change: 'added' | 'removed' | 'moved' | 'props' | 'text' | 'style' | 'layout' | 'override' | 'component' | 'note';
  detail: string;
}

export interface Handover {
  format: typeof HANDOVER_FORMAT;
  formatVersion: number;
  name: string;
  exportedAt: string;
  /** How to build from this file — for the developer, and for Claude reading it. */
  readme: string[];
  atoms: {
    /** The release the page was built with, read from its development marks. */
    version: string | null;
    /** The release the inspector's tokens come from. */
    inspectorVersion: string;
    /** Whether the page carried development marks, which make token names exact. */
    marked: boolean;
  };
  source: {
    url: string;
    title: string;
    viewport: { width: number; height: number };
    mode: 'light' | 'dark';
  };
  scope: {
    kind: 'screen' | 'selection';
    /** What was selected: a component name, a region, or a tag. */
    label: string;
    size: { width: number; height: number };
  };
  pattern: { name: string; regions: string[] } | null;
  /** The screenshot that goes with this file, when one was exported alongside it. */
  image?: string;
  summary: {
    components: Record<string, number>;
    layouts: Record<string, number>;
    icons: string[];
    tokens: string[];
  };
  deviations: Deviation[];
  tree: HandoverNode;
  /** Set when the tree was cut short. */
  truncated?: true;
  /** Set by Studio: the design was changed after capture, and how. */
  edited?: { at: string; edits: Edit[] };
  /** A note on the whole screen, written in Studio. */
  note?: string;
}
