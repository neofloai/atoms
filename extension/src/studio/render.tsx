/**
 * Turns a handover tree back into React with the real Atoms library.
 *
 * Runs inside the canvas iframe, under its own Emotion cache and theme,
 * so the design renders exactly as the package draws it — and responds to
 * the iframe's width, not Studio's. Every rendered node carries
 * `data-studio-id` so the canvas can map a click back to it.
 */
import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IconContext } from '@phosphor-icons/react';
import * as Atoms from '../../../src/index';
import { neofloTheme } from '../../../src/theme';
import { overridesSx } from './overrides';
import { colorToken, cssPropertiesFor, styleKind } from './tokens';

import type { Theme } from '@mui/material/styles';
import type { ComponentNode, HandoverNode, Layout, StyleValue } from '../shared/schema';

declare const __ATOMS_COMPONENTS__: string[];

type AnyComponent = React.ElementType;

/** Atoms components by name, plus the layout primitives it re-exports. */
export const REGISTRY: Record<string, AnyComponent> = {};
for (const name of [...__ATOMS_COMPONENTS__, 'Box', 'Stack', 'Grid', 'Container']) {
  const value = (Atoms as unknown as Record<string, unknown>)[name];
  if (value && (typeof value === 'function' || typeof value === 'object')) REGISTRY[name] = value as AnyComponent;
}

let icons: Record<string, AnyComponent> | null = null;

/** The whole Phosphor set, loaded once, on first need. */
export async function loadIcons(): Promise<Record<string, AnyComponent>> {
  icons ??= (await import('virtual:atoms-icons')) as unknown as Record<string, AnyComponent>;
  return icons;
}

export const iconNames = () => Object.keys(icons ?? {}).filter((n) => n.endsWith('Icon'));
export const iconComponent = (name: string) => icons?.[name];

// ---------------------------------------------------------------- values

const REMOVE = Symbol('remove');
const MARKER = /^<(function|object|circular|\d+ (more|items)|[a-z0-9-]+ element)>$/;
const noop = () => {};

/** A captured prop value back to something React can take. */
function hydrate(value: unknown, key = ''): unknown {
  if (typeof value === 'string') {
    if (value === '<function>') return /^on[A-Z]/.test(key) ? noop : REMOVE;
    return MARKER.test(value) ? REMOVE : value;
  }
  if (Array.isArray(value)) return value.map((v) => hydrate(v)).filter((v) => v !== REMOVE);
  if (value && typeof value === 'object') {
    if ('$element' in value) return elementFrom(value as { $element: string; props?: Record<string, unknown>; text?: string });
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const h = hydrate(v, k);
      if (h !== REMOVE) out[k] = h;
    }
    return out;
  }
  return value;
}

function hydrateProps(props: Record<string, unknown>): Record<string, unknown> {
  return hydrate(props) as Record<string, unknown>;
}

/** An element passed through a prop (`startIcon={<CaretDownIcon />}`). */
function elementFrom(el: { $element: string; props?: Record<string, unknown>; text?: string }): React.ReactNode {
  const props = hydrateProps(el.props ?? {});
  const type = REGISTRY[el.$element] ?? icons?.[el.$element] ?? (/^[a-z]/.test(el.$element) ? el.$element : null);
  // Something of the design's own passed through a prop (a styled span): its text is what survives.
  if (!type) return el.text ? <span>{el.text}</span> : <span data-studio-missing="" title={el.$element} />;
  return React.createElement(type, props, el.text);
}

const camel = (property: string) => property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** Layout, placement and matched styles as an `sx` function; colour tokens follow the canvas mode. */
export function styleSx(styles?: Record<string, StyleValue>, layout?: Layout, box?: Record<string, string>) {
  const base: Record<string, string> = {};
  const dark: Record<string, string> = {};
  if (layout) {
    base.display = layout.display.replace(' ', '-');
    if (layout.direction) base.flexDirection = layout.direction;
    if (layout.align) base.alignItems = layout.align;
    if (layout.justify) base.justifyContent = layout.justify;
    if (layout.wrap) base.flexWrap = layout.wrap;
    if (layout.columns) base.gridTemplateColumns = layout.columns;
  }
  for (const [k, v] of Object.entries(box ?? {})) base[camel(k)] = v;
  for (const [key, style] of Object.entries(styles ?? {})) {
    const css = { ...style.css };
    // A border needs a style to draw at all.
    for (const k of Object.keys(css)) if (/width$/.test(k) && /^border/.test(k) && !css[k.replace(/width$/, 'style')]) css[k.replace(/width$/, 'style')] = 'solid';
    const token = styleKind(key) === 'color' ? colorToken(style.token) : null;
    const colourProperty = cssPropertiesFor(key)[0];
    for (const [k, v] of Object.entries(css)) {
      if (token && (k === colourProperty || (/color$/.test(k) && /^border/.test(k)))) continue;
      base[camel(k)] = v;
    }
    if (token) {
      base[camel(colourProperty)] = token.light;
      dark[camel(colourProperty)] = token.dark;
    }
  }
  return (theme: Theme) => ({ ...base, ...theme.applyStyles('dark', dark) });
}

// ---------------------------------------------------------------- nodes

class Boundary extends React.Component<{ label: string; id?: string; children: React.ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  render() {
    if (this.state.error) {
      return (
        <span data-studio-id={this.props.id} data-studio-broken="" title={this.state.error}>
          {this.props.label} could not render
        </span>
      );
    }
    return this.props.children;
  }
}

const VOID = /^(img|input|hr|br|area|col|embed|source|track|wbr)$/;

function renderList(nodes: HandoverNode[] | undefined, replica: boolean): React.ReactNode {
  if (!nodes?.length) return undefined;
  return nodes.filter((n) => !(n.kind === 'component' && n.renderedBy)).map((n, i) => <Node key={`${n.id ?? i}`} node={n} replica={replica} />);
}

export function Node({ node, replica = false }: { node: HandoverNode; replica?: boolean }): React.ReactNode {
  const mark = { 'data-studio-id': node.id, ...(replica ? { 'data-studio-replica': '' } : {}) };
  switch (node.kind) {
    case 'text':
      return node.text;

    case 'repeat': {
      if (!node.items.length) return null;
      const count = Math.max(node.count, node.items.length);
      return Array.from({ length: count }, (_, i) => {
        const item = node.items[i % node.items.length];
        return <Node key={`${item.id}#${i}`} node={item} replica={replica || i >= node.items.length} />;
      });
    }

    case 'icon': {
      const Icon = icons?.[node.name];
      if (!Icon) return <span {...mark} data-studio-missing="">{node.name}</span>;
      return <Icon {...hydrateProps(node.props)} {...mark} />;
    }

    case 'component': {
      const Component = REGISTRY[node.name];
      if (!Component) return <span {...mark} data-studio-missing="">{node.name}</span>;
      const props = hydrateProps(node.props);
      if (node.name === 'DataGrid') withCells(node, props, replica);
      const sx = [hydrate(node.sx), overridesSx(node.overrides)].filter((s) => s && s !== REMOVE);
      const children = node.text ?? renderList(node.children, replica);
      return (
        <Boundary label={node.name} id={node.id}>
          <Component {...props} {...(sx.length ? { sx } : {})} {...(node.style ? { style: node.style } : {})} {...mark}>
            {children}
          </Component>
        </Boundary>
      );
    }

    case 'layout': {
      const Primitive = REGISTRY[node.name] ?? REGISTRY.Box;
      const props = hydrateProps(node.props);
      const own = hydrate(node.sx);
      const sx = [...(own && own !== REMOVE ? [own] : []), styleSx(node.styles, node.layout)];
      return (
        <Boundary label={node.name} id={node.id}>
          <Primitive {...props} sx={sx} {...mark}>
            {renderList(node.children, replica)}
          </Primitive>
        </Boundary>
      );
    }

    case 'element': {
      const Box = REGISTRY.Box;
      const sx = styleSx(node.styles, node.layout, node.box);
      const attrs = node.attrs ?? {};
      if (node.tag === 'svg') {
        const size = { width: node.rect[2], height: node.rect[3], display: 'inline-flex', flexShrink: 0, '& > svg': { width: '100%', height: '100%' } };
        return attrs.markup ? (
          <Box component="span" sx={[size, sx]} dangerouslySetInnerHTML={{ __html: attrs.markup }} {...mark} />
        ) : (
          <Box component="span" sx={[size, sx]} data-studio-missing="" {...mark} />
        );
      }
      const own: Record<string, string> = {};
      if (node.tag === 'img') Object.assign(own, { src: attrs.src ?? '', alt: attrs.alt ?? '' });
      if (node.tag === 'a' && attrs.href) own.href = attrs.href;
      if (node.tag === 'input' || node.tag === 'textarea') {
        if (attrs.placeholder) own.placeholder = attrs.placeholder;
        if (attrs.type) own.type = attrs.type;
        if (attrs.value) own.defaultValue = attrs.value;
      }
      if (attrs.title) own.title = attrs.title;
      if (VOID.test(node.tag)) return <Box component={node.tag} sx={sx} {...own} {...mark} />;
      return (
        <Box component={node.tag} sx={sx} {...own} {...mark}>
          {node.text ?? renderList(node.children, replica)}
        </Box>
      );
    }
  }
}

/**
 * A grid's cell renderers and formatters are functions, which a handover
 * cannot carry. Columns that had one draw what was captured instead: the
 * components the renderer drew in that cell, or the cell's text.
 */
function withCells(node: ComponentNode, props: Record<string, unknown>, replica: boolean) {
  const raw = node.props.columns;
  const columns = props.columns;
  if (!Array.isArray(raw) || !Array.isArray(columns)) return;
  const drawn = new Map<string, HandoverNode[]>();
  for (const kid of node.children ?? []) {
    if (kid.kind !== 'component' || !kid.cell) continue;
    const key = `${kid.cell.row}|${kid.cell.field}`;
    drawn.set(key, [...(drawn.get(key) ?? []), kid]);
  }
  props.columns = columns.map((column: Record<string, unknown>, i: number) => {
    const original = raw[i] as Record<string, unknown> | undefined;
    const functions = ['renderCell', 'valueFormatter', 'valueGetter'].some((k) => original?.[k] === '<function>');
    if (!functions) return column;
    return {
      ...column,
      renderCell: (params: { id: string | number; field: string; formattedValue?: unknown; value?: unknown }) => {
        const nodes = drawn.get(`${params.id}|${params.field}`);
        if (nodes) return nodes.map((n) => <Node key={n.id} node={n} replica={replica} />);
        const text = node.cells?.[String(params.id)]?.[params.field];
        // Captured text keeps its line breaks: a cell renderer often stacks two lines.
        return text !== undefined ? <span style={{ whiteSpace: 'pre-line', lineHeight: 1.35 }}>{text}</span> : String(params.formattedValue ?? params.value ?? '');
      },
    };
  });
}

// ---------------------------------------------------------------- canvas root

const ICON_DEFAULTS = { size: 24, weight: 'regular', color: 'currentColor', mirrored: false } as const;

function ModeSync({ mode }: { mode: 'light' | 'dark' }) {
  const { setMode } = useColorScheme();
  React.useEffect(() => setMode(mode), [mode, setMode]);
  return null;
}

/**
 * The Atoms theme uses CSS variables, so MUI's provider takes the
 * document and colour-scheme node options at runtime; its types only
 * offer them for a theme typed that way.
 */
const VarsThemeProvider = ThemeProvider as unknown as React.ComponentType<Record<string, unknown> & { children: React.ReactNode }>;

/** The theme, fonts and providers an Atoms app has, pointed at the iframe's document. */
export function CanvasRoot({ doc, mode, children }: { doc: Document; mode: 'light' | 'dark'; children: React.ReactNode }) {
  const cache = React.useMemo(() => createCache({ key: 'canvas', container: doc.head, prepend: true }), [doc]);
  return (
    <CacheProvider value={cache}>
      <VarsThemeProvider
        theme={neofloTheme}
        documentNode={doc}
        colorSchemeNode={doc.documentElement}
        storageManager={null}
        defaultMode={mode}
        disableTransitionOnChange
      >
        <ModeSync mode={mode} />
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <IconContext.Provider value={ICON_DEFAULTS}>{children}</IconContext.Provider>
        </LocalizationProvider>
      </VarsThemeProvider>
    </CacheProvider>
  );
}
