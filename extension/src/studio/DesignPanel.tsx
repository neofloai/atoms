/**
 * The right-hand panel for whatever is selected: a component's props as
 * controls generated from its documented types, its colours, any `sx` it
 * carries, and — for layout and plain elements — every style as a token
 * picker. Nothing here takes a raw value: an edit either picks a prop the
 * library offers or a token it defines.
 */
import * as React from 'react';
import { metaOf, type PropMeta } from './meta';
import { OVERRIDE_PROPERTIES, joinKey, measuredValue, partSelector, splitKey, type OverrideGroup, type OverrideProperty } from './overrides';
import {
  acceptsChildren,
  duplicateNode,
  find,
  index,
  labelOf,
  moveNode,
  removeNode,
  removeSx,
  setStyle,
  sxEntries,
  wrapInStack,
  type Located,
} from './model';
import { REGISTRY, iconNames } from './render';
import {
  colorCategoryFor,
  familyOptions,
  radiusOptions,
  shadowOptions,
  spaceOptions,
  styleForToken,
  styleKind,
  typeOptions,
  weightOptions,
} from './tokens';
import { Button, CommitInput, Picker, Row, colorPickerOptions, scalePickerOptions, typePickerOptions } from './ui';

import type { ComponentNode, ElementNode, Handover, HandoverNode, IconNode, LayoutNode } from '../shared/schema';

export type Update = (change: (doc: Handover) => void, coalesce?: string) => void;

interface Props {
  doc: Handover;
  selected: string | null;
  update: Update;
  select(id: string | null): void;
  focusText: number;
  /** The element on the canvas the selection measures from — the node's own, or a part ⌘-clicked inside it. */
  inspected: Element | null;
}

export function DesignPanel({ doc, selected, update, select, focusText, inspected }: Props) {
  const map = React.useMemo(() => index(doc.tree), [doc]);
  const at = selected ? map.get(selected) : undefined;
  if (!at) {
    return (
      <div className="section">
        <h3>Nothing selected</h3>
        <p className="hint">Click something on the canvas or in Layers. Drag it to move it, and use the pickers here to change its props and tokens.</p>
        <Shortcuts />
      </div>
    );
  }
  const node = at.node;
  const id = node.id!;
  const ancestors: HandoverNode[] = [];
  for (let p = at.parent; p; p = p.id ? map.get(p.id)?.parent ?? null : null) ancestors.unshift(p);

  return (
    <>
      <div className="section">
        <div className="crumbs">
          {ancestors.slice(-4).map((a) => (
            <button type="button" className="crumb" key={a.id} onClick={() => select(a.id!)}>
              {labelOf(a)}
            </button>
          ))}
        </div>
        <div className="node-name">{labelOf(node)}</div>
        <div className="node-kind">
          {kindLabel(node)}
          {'region' in node && node.region ? ` · region ${node.region}` : ''}
        </div>
        <NodeActions at={at} update={update} select={select} />
      </div>
      {node.kind === 'component' ? <ComponentSection node={node} doc={doc} update={update} focusText={focusText} inspected={inspected} /> : null}
      {node.kind === 'layout' || node.kind === 'element' ? <StyleSection node={node} doc={doc} update={update} focusText={focusText} inspected={ownElement(inspected, id)} /> : null}
      {node.kind === 'icon' ? <IconSection node={node} update={update} /> : null}
      {node.kind === 'text' ? (
        <div className="section">
          <h3>Text</h3>
          <CommitInput key={`${id}-${focusText}`} autoFocus={focusText > 0} multiline value={node.text} onCommit={(v) => update((d) => { const n = find(d, id)?.node; if (n?.kind === 'text') n.text = v; })} />
        </div>
      ) : null}
      {node.kind === 'repeat' ? (
        <div className="section">
          <h3>List</h3>
          <Row label="Items">
            <CommitInput value={String(node.count)} onCommit={(v) => update((d) => { const n = find(d, id)?.node; if (n?.kind === 'repeat') n.count = Math.max(n.items.length, Math.min(500, Number(v) || n.count)); })} />
          </Row>
          <p className="hint">{node.count > node.items.length ? `The first ${node.items.length} items are kept in full; the other ${node.count - node.items.length} repeat them.` : 'Every item is kept in full.'} Raise the count to see the list longer.</p>
        </div>
      ) : null}
      {node.kind !== 'text' && node.kind !== 'repeat' ? (
        <div className="section">
          <h3>Note for the developer</h3>
          <CommitInput multiline placeholder="What it does, what it links to, what changes on hover…" value={node.note ?? ''} onCommit={(v) => update((d) => { const n = find(d, id)?.node; if (n && n.kind !== 'text' && n.kind !== 'repeat') { if (v.trim()) n.note = v; else delete n.note; } })} />
        </div>
      ) : null}
    </>
  );
}

function kindLabel(node: HandoverNode) {
  switch (node.kind) {
    case 'component':
      return node.renderedBy ? `Atoms component, drawn by ${node.renderedBy}` : 'Atoms component';
    case 'layout':
      return 'Layout primitive';
    case 'element':
      return 'Plain element — not an Atoms component';
    case 'icon':
      return 'Icon';
    case 'text':
      return 'Text';
    case 'repeat':
      return `List of ${node.count}, ${node.items.length} sample${node.items.length === 1 ? '' : 's'}`;
  }
}

function Shortcuts() {
  return (
    <div className="keys" style={{ marginTop: 12 }}>
      <kbd>Drag</kbd><span>move within a layout, or into another</span>
      <kbd>Drag a handle</kbd><span>resize the selection (Shift snaps to 4px)</span>
      <kbd>Drag from Insert</kbd><span>drop a component or icon where the line shows</span>
      <kbd>⌥ ↑ / ↓</kbd><span>move before or after a sibling</span>
      <kbd>⌘ D</kbd><span>duplicate</span>
      <kbd>⌫</kbd><span>delete</span>
      <kbd>⌘ C / ⌘ V</kbd><span>copy and paste</span>
      <kbd>⌘ Z / ⇧ ⌘ Z</kbd><span>undo and redo</span>
      <kbd>Esc</kbd><span>select the parent</span>
      <kbd>Double-click</kbd><span>edit text</span>
      <kbd>Alt + hover</kbd><span>measure from the selection</span>
      <kbd>Pinch</kbd><span>zoom at the pointer (or ⌘ + scroll)</span>
      <kbd>⌘ + / ⌘ − / ⌘ 0 / ⇧ 1</kbd><span>zoom in, out, 100%, fit</span>
      <kbd>Space + drag</kbd><span>pan the canvas</span>
      <kbd>⌘ + click</kbd><span>measure the exact element inside a component</span>
    </div>
  );
}

function NodeActions({ at, update, select }: { at: Located; update: Update; select(id: string | null): void }) {
  const id = at.node.id!;
  const root = !at.parent;
  const siblings = at.parent ? (at.parent.kind === 'repeat' ? at.parent.items : at.parent.kind !== 'text' && at.parent.kind !== 'icon' ? at.parent.children ?? [] : []) : [];
  return (
    <div className="actions">
      <Button className="solid" disabled={root || at.index === 0} title="Move before the previous sibling (⌥↑)" onClick={() => update((d) => moveNode(d, id, at.parent!.id!, at.index - 1))}>↑</Button>
      <Button className="solid" disabled={root || at.index >= siblings.length - 1} title="Move after the next sibling (⌥↓)" onClick={() => update((d) => moveNode(d, id, at.parent!.id!, at.index + 2))}>↓</Button>
      <Button className="solid" disabled={root} title="Duplicate (⌘D)" onClick={() => { let next: string | null = null; update((d) => { next = duplicateNode(d, id); }); if (next) select(next); }}>Duplicate</Button>
      <Button className="solid" disabled={root} title="Wrap in a Stack" onClick={() => { let next: string | null = null; update((d) => { next = wrapInStack(d, id, 'row'); }); if (next) select(next); }}>Wrap</Button>
      <Button className="solid danger" disabled={root} title="Delete (⌫)" onClick={() => { update((d) => removeNode(d, id)); select(at.parent?.id ?? null); }}>Delete</Button>
    </div>
  );
}

// ---------------------------------------------------------------- components

function ComponentSection({ node, doc, update, focusText, inspected }: { node: ComponentNode; doc: Handover; update: Update; focusText: number; inspected: Element | null }) {
  const id = node.id;
  const meta = metaOf(node.name);
  const mutate = (fn: (n: ComponentNode) => void, coalesce?: string) =>
    update((d) => {
      const n = find(d, id)?.node;
      if (n?.kind === 'component') fn(n);
    }, coalesce);
  const setProp = (name: string, value: unknown) =>
    mutate((n) => {
      if (value === undefined) delete n.props[name];
      else n.props[name] = value;
    });
  const known = new Set(meta?.props.map((p) => p.name) ?? []);
  const extra = Object.keys(node.props).filter((k) => !known.has(k));
  const hasElementChildren = !!node.children?.some((c) => !(c.kind === 'component' && c.renderedBy));
  const sx = sxEntries(node.sx);
  const names = Object.keys(REGISTRY).sort();

  return (
    <>
      <div className="section">
        <h3>Component</h3>
        <Row label="Type" title="Swap for another Atoms component. Props they share are kept.">
          <select className="select" value={node.name} onChange={(e) => mutate((n) => {
            const next = metaOf(e.target.value);
            n.name = e.target.value;
            if (next) for (const key of Object.keys(n.props)) if (!next.props.some((p) => p.name === key) && !/^(on[A-Z]|aria-|data-)/.test(key)) delete n.props[key];
            delete n.tokens;
          })}>
            {names.map((n) => <option key={n}>{n}</option>)}
          </select>
        </Row>
        {meta?.tagline ? <p className="hint">{meta.tagline}</p> : null}
      </div>
      {node.text !== undefined || (meta?.children && !hasElementChildren) ? (
        <div className="section">
          <h3>Text</h3>
          <CommitInput key={`${id}-${focusText}`} autoFocus={focusText > 0} value={node.text ?? ''} placeholder="Label" onCommit={(v) => mutate((n) => { if (v) n.text = v; else delete n.text; })} />
        </div>
      ) : null}
      <div className="section">
        <h3>Props</h3>
        {meta?.props.filter((p) => p.control.kind !== 'readonly').map((p) => (
          <PropControl key={p.name} meta={p} value={node.props[p.name]} onChange={(v) => setProp(p.name, v)} />
        ))}
        {extra.map((key) => (
          <Row key={key} label={key} onReset={() => setProp(key, undefined)}>
            {node.props[key] === '<function>' ? <span className="muted mono">handler</span> : (
              <CommitInput mono value={JSON.stringify(node.props[key])} onCommit={(v) => { try { setProp(key, JSON.parse(v)); } catch { setProp(key, v); } }} />
            )}
          </Row>
        ))}
        {!meta ? <p className="hint">No documented props for {node.name}.</p> : null}
      </div>
      <ComponentStyle key={`${id}:${inspectedKey(inspected, id)}`} node={node} inspected={inspected} doc={doc} mutate={mutate} />
      {sx.length || node.style ? (
        <div className="section">
          <h3>Overrides in the design</h3>
          {sx.map((e) => (
            <Row key={e.property} label={e.property} onReset={() => mutate((n) => removeSx(n, e.property))}>
              <span className="mono muted">{JSON.stringify(e.value)}</span>
            </Row>
          ))}
          {Object.entries(node.style ?? {}).map(([k, v]) => (
            <Row key={k} label={`style ${k}`} onReset={() => mutate((n) => { delete n.style![k]; if (!Object.keys(n.style!).length) delete n.style; })}>
              <span className="mono muted">{v}</span>
            </Row>
          ))}
          <p className="hint">The design passed these as <span className="mono">sx</span> or <span className="mono">style</span>. Remove the ones that restyle the component (×).</p>
        </div>
      ) : null}
    </>
  );
}

function PropControl({ meta, value, onChange }: { meta: PropMeta; value: unknown; onChange(v: unknown): void }) {
  const reset = value !== undefined ? () => onChange(undefined) : undefined;
  const title = [meta.type, meta.default ? `default ${meta.default}` : '', meta.description ?? ''].filter(Boolean).join(' — ');
  const c = meta.control;
  let control: React.ReactNode;
  if (c.kind === 'select') {
    const defaultValue = meta.default?.replace(/^'|'$/g, '');
    control = (
      <select className="select" value={value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value)}>
        <option value="">{defaultValue ? `${defaultValue} (default)` : 'default'}</option>
        {c.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  } else if (c.kind === 'boolean') {
    control = (
      <label className="toggle">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked ? true : undefined)} />
        <span className="muted">{value === true ? 'on' : 'off'}</span>
      </label>
    );
  } else if (c.kind === 'number') {
    control = <CommitInput value={value === undefined ? '' : String(value)} placeholder={meta.default ?? ''} onCommit={(v) => onChange(v === '' ? undefined : Number(v))} />;
  } else if (isElementValue(value) ? /Icon$/.test(value.$element) : /Icon$/.test(meta.name) && /ReactNode|ReactElement/.test(meta.type)) {
    control = <IconProp value={isElementValue(value) ? value : undefined} onChange={onChange} />;
  } else if (c.kind === 'text') {
    control = typeof value === 'object' && value !== null ? <span className="muted mono">element</span> : <CommitInput value={value === undefined ? '' : String(value)} placeholder={meta.default ?? ''} onCommit={(v) => onChange(v === '' ? undefined : v)} />;
  } else {
    control = <CommitInput mono value={value === undefined ? '' : JSON.stringify(value)} placeholder={meta.type.slice(0, 40)} onCommit={(v) => { if (v === '') onChange(undefined); else { try { onChange(JSON.parse(v)); } catch { onChange(v); } } }} />;
  }
  return (
    <Row label={meta.name} title={title} onReset={reset}>
      {control}
    </Row>
  );
}

// ---------------------------------------------------------------- layout and elements

const STYLE_LABELS: Record<string, string> = {
  background: 'Fill',
  text: 'Text colour',
  border: 'Border',
  radius: 'Radius',
  shadow: 'Shadow',
  gap: 'Gap',
  padding: 'Padding',
  margin: 'Margin',
  type: 'Type',
  weight: 'Weight',
  family: 'Font',
  width: 'Width',
  height: 'Height',
  minWidth: 'Min width',
  minHeight: 'Min height',
  maxWidth: 'Max width',
};

const ADDABLE = ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'background', 'text', 'border', 'radius', 'shadow', 'gap', 'padding', 'margin', 'type', 'weight', 'family'];

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const toPx = (v: string) => (/^\d+(\.\d+)?$/.test(v.trim()) ? `${v.trim()}px` : v.trim());

/** A size style: pixels, or any CSS length (`100%`, `auto`) — Atoms has no size scale. */
export function sizeStyle(key: string, value: string) {
  const v = toPx(value);
  return { value: v, css: { [kebab(key)]: v } };
}

function optionsFor(key: string) {
  switch (styleKind(key)) {
    case 'color':
      return colorPickerOptions([colorCategoryFor(key), ...(key === 'fill' || key === 'stroke' ? (['text'] as const) : [])]);
    case 'space':
      return scalePickerOptions(spaceOptions);
    case 'radius':
      return scalePickerOptions(radiusOptions);
    case 'shadow':
      return scalePickerOptions(shadowOptions);
    case 'type':
      return typePickerOptions(typeOptions);
    case 'weight':
      return scalePickerOptions(weightOptions);
    case 'family':
      return scalePickerOptions(familyOptions);
    default:
      return [];
  }
}

function StyleSection({ node, doc, update, focusText, inspected }: { node: LayoutNode | ElementNode; doc: Handover; update: Update; focusText: number; inspected: Element | null }) {
  const measured = useMeasured(inspected, doc);
  const id = node.id;
  const styles = node.styles ?? {};
  const mutate = (fn: (n: LayoutNode | ElementNode) => void) =>
    update((d) => {
      const n = find(d, id)?.node;
      if (n?.kind === 'layout' || n?.kind === 'element') fn(n);
    });
  const layout = node.layout;
  const setLayout = (key: 'display' | 'direction' | 'align' | 'justify' | 'wrap', value: string | undefined) =>
    mutate((n) => {
      n.layout ??= { display: 'flex' };
      if (value === undefined) delete n.layout[key];
      else n.layout[key] = value;
      if (n.kind === 'layout') {
        if (key === 'direction') n.props.direction = value;
        const sx = n.sx as Record<string, unknown> | undefined;
        if (sx && typeof sx === 'object') for (const k of { display: ['display'], direction: ['flexDirection'], align: ['alignItems'], justify: ['justifyContent'], wrap: ['flexWrap'] }[key]) delete sx[k];
      }
    });
  const pick = (key: string, path: string) => update((d) => setStyle(d, id, key, styleForToken(key, path, styles[key]?.css)));
  const clear = (key: string) => update((d) => setStyle(d, id, key, null));
  const keys = Object.keys(styles).filter((k) => styleKind(k) !== 'other' || k === 'opacity');
  const grouped = {
    Size: keys.filter((k) => styleKind(k) === 'size'),
    Spacing: keys.filter((k) => styleKind(k) === 'space'),
    Appearance: keys.filter((k) => ['color', 'radius', 'shadow'].includes(styleKind(k)) || k === 'opacity'),
    Type: keys.filter((k) => ['type', 'weight', 'family'].includes(styleKind(k))),
  };

  return (
    <>
      {node.kind === 'element' && node.text !== undefined ? (
        <div className="section">
          <h3>Text</h3>
          <CommitInput key={`${id}-${focusText}`} autoFocus={focusText > 0} multiline value={node.text} onCommit={(v) => mutate((n) => { if (n.kind === 'element') n.text = v; })} />
        </div>
      ) : null}
      <div className="section">
        <h3>Layout</h3>
        <Row label="Display">
          <select className="select" value={layout?.display ?? ''} onChange={(e) => setLayout('display', e.target.value || undefined)}>
            <option value="">{node.kind === 'element' ? node.tag === 'span' ? 'inline' : 'block' : 'default'}</option>
            <option value="flex">flex</option>
            <option value="inline flex">inline flex</option>
            <option value="grid">grid</option>
            <option value="block">block</option>
          </select>
        </Row>
        {layout && /flex/.test(layout.display) ? (
          <>
            <Row label="Direction">
              <div className="seg">
                {['row', 'column'].map((d) => (
                  <Button key={d} className={(layout.direction ?? 'row').startsWith(d) ? 'on' : ''} onClick={() => setLayout('direction', d)}>{d === 'row' ? '→ Row' : '↓ Column'}</Button>
                ))}
              </div>
            </Row>
            <Row label="Align">
              <select className="select" value={layout.align ?? ''} onChange={(e) => setLayout('align', e.target.value || undefined)}>
                <option value="">stretch</option>
                {['flex-start', 'center', 'flex-end', 'baseline'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </Row>
            <Row label="Justify">
              <select className="select" value={layout.justify ?? ''} onChange={(e) => setLayout('justify', e.target.value || undefined)}>
                <option value="">flex-start</option>
                {['center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </Row>
            <Row label="Wrap">
              <label className="toggle"><input type="checkbox" checked={layout.wrap === 'wrap'} onChange={(e) => setLayout('wrap', e.target.checked ? 'wrap' : undefined)} /><span className="muted">wrap</span></label>
            </Row>
          </>
        ) : null}
      </div>
      {Object.entries(grouped).map(([title, list]) => (
        <div className="section" key={title}>
          <h3>{title}</h3>
          {list.map((key) => (
            <Row key={key} label={STYLE_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').toLowerCase()} onReset={() => clear(key)}>
              {key === 'opacity' ? <span className="mono muted">{styles[key].value}</span> : styleKind(key) === 'size' ? (
                <PixelInput value={styles[key].value} onCommit={(v) => update((d) => setStyle(d, id, key, v ? sizeStyle(key, v) : null))} />
              ) : (
                <Picker value={styles[key].token} display={styles[key].value} off={styles[key].off} options={optionsFor(key)} onPick={(path) => pick(key, path)} />
              )}
              {styles[key].off ? <p className="hint off">{styles[key].note ?? 'not a token'}</p> : null}
            </Row>
          ))}
          <select
            className="select"
            value=""
            onChange={(e) => {
              const key = e.target.value;
              if (!key) return;
              // A size starts at what the canvas draws now, so adding it changes nothing until it is edited.
              if (styleKind(key) === 'size') update((d) => setStyle(d, id, key, sizeStyle(key, measured[/^(width|minWidth|maxWidth)$/.test(key) ? 'width' : 'height'] ?? 'auto')));
              else pick(key, optionsFor(key)[title === 'Spacing' ? 2 : 0].path);
            }}
          >
            <option value="">Add {title.toLowerCase()}…</option>
            {ADDABLE.filter((k) => !styles[k] && (title === 'Size' ? styleKind(k) === 'size' : title === 'Spacing' ? styleKind(k) === 'space' : title === 'Type' ? ['type', 'weight', 'family'].includes(styleKind(k)) : ['color', 'radius', 'shadow'].includes(styleKind(k)))).map((k) => (
              <option key={k} value={k}>{STYLE_LABELS[k]}</option>
            ))}
            {title === 'Spacing' ? ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].filter((k) => !styles[k]).map((k) => <option key={k} value={k}>{k.replace('padding', 'Padding ').toLowerCase()}</option>) : null}
          </select>
        </div>
      ))}
      {node.kind === 'layout' ? <LayoutProps node={node} update={update} /> : null}
      {node.kind === 'element' && node.attrs && (node.tag === 'img' || node.tag === 'a') ? (
        <div className="section">
          <h3>Attributes</h3>
          {(node.tag === 'img' ? ['src', 'alt'] : ['href']).map((k) => (
            <Row key={k} label={k}>
              <CommitInput mono value={node.attrs?.[k] ?? ''} onCommit={(v) => mutate((n) => { if (n.kind === 'element') n.attrs = { ...n.attrs, [k]: v }; })} />
            </Row>
          ))}
        </div>
      ) : null}
      {acceptsChildren(node) ? null : <div className="section"><p className="hint">Drop targets: this element holds text or media only.</p></div>}
    </>
  );
}

function LayoutProps({ node, update }: { node: LayoutNode; update: Update }) {
  const meta = metaOf(node.name);
  const id = node.id;
  const setProp = (name: string, value: unknown) =>
    update((d) => {
      const n = find(d, id)?.node;
      if (n?.kind !== 'layout') return;
      if (value === undefined) delete n.props[name];
      else n.props[name] = value;
    });
  const shown = new Set([...(meta?.props.filter((p) => p.control.kind !== 'readonly').map((p) => p.name) ?? []), ...Object.keys(node.props)]);
  return (
    <div className="section">
      <h3>{node.name} props</h3>
      {[...shown].map((name) => {
        const p = meta?.props.find((m) => m.name === name);
        return p ? (
          <PropControl key={name} meta={p} value={node.props[name]} onChange={(v) => setProp(name, v)} />
        ) : (
          <Row key={name} label={name} onReset={() => setProp(name, undefined)}>
            <CommitInput mono value={JSON.stringify(node.props[name])} onCommit={(v) => { try { setProp(name, JSON.parse(v)); } catch { setProp(name, v); } }} />
          </Row>
        );
      })}
      {sxEntries(node.sx).length ? (
        <>
          <p className="hint">Written as <span className="mono">sx</span> in the design:</p>
          {sxEntries(node.sx).map((e) => (
            <Row key={e.property} label={e.property} onReset={() => update((d) => { const n = find(d, id)?.node; if (n?.kind === 'layout') removeSx(n, e.property); })}>
              <span className="mono muted">{JSON.stringify(e.value)}</span>
            </Row>
          ))}
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- icons

function IconSection({ node, update }: { node: IconNode; update: Update }) {
  const id = node.id;
  const mutate = (fn: (n: IconNode) => void) => update((d) => { const n = find(d, id)?.node; if (n?.kind === 'icon') fn(n); });
  const icons = React.useMemo(() => iconNames().map((n) => ({ path: n, label: n.replace(/Icon$/, ''), group: n[0] })), []);
  return (
    <div className="section">
      <h3>Icon</h3>
      <Row label="Glyph">
        <Picker value={node.name} options={icons} onPick={(name) => mutate((n) => { n.name = name; })} placeholder="Pick an icon" />
      </Row>
      <Row label="Size" onReset={node.props.size !== undefined ? () => mutate((n) => { delete n.props.size; }) : undefined}>
        <select className="select" value={String(node.props.size ?? '')} onChange={(e) => mutate((n) => { if (e.target.value) n.props.size = Number(e.target.value); else delete n.props.size; })}>
          <option value="">24 (default)</option>
          {[12, 14, 16, 20, 24, 32, 48].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Row>
      <Row label="Weight" onReset={node.props.weight !== undefined ? () => mutate((n) => { delete n.props.weight; }) : undefined}>
        <select className="select" value={String(node.props.weight ?? '')} onChange={(e) => mutate((n) => { if (e.target.value) n.props.weight = e.target.value; else delete n.props.weight; })}>
          <option value="">regular (default)</option>
          {['thin', 'light', 'bold', 'fill', 'duotone'].map((w) => <option key={w}>{w}</option>)}
        </select>
      </Row>
    </div>
  );
}

// ---------------------------------------------------------------- component style

/** The node's own element on the canvas, when `inspected` is it or inside it. */
function ownElement(inspected: Element | null, id: string): Element | null {
  const root = inspected?.closest('[data-studio-id]');
  return root && root.getAttribute('data-studio-id') === id ? root : null;
}

/** Changes whenever a different part of the node is ⌘-clicked, so the style section follows it. */
function inspectedKey(inspected: Element | null, id: string): string {
  const root = ownElement(inspected, id);
  return root && inspected && inspected !== root ? partSelector(inspected, root) ?? '' : '';
}

/** What the canvas draws now for every override property, read after the latest edit has rendered. */
function useMeasured(el: Element | null, doc: Handover): Record<string, string> {
  const [values, setValues] = React.useState<{ el: Element | null; values: Record<string, string> }>({ el: null, values: {} });
  React.useEffect(() => {
    if (!el) return;
    const read = () => {
      if (!el.isConnected) return;
      const next: Record<string, string> = {};
      for (const p of OVERRIDE_PROPERTIES) next[p.key] = measuredValue(el, p.key);
      setValues({ el, values: next });
    };
    const t = setTimeout(read, 60);
    const observer = new (el.ownerDocument.defaultView ?? window).ResizeObserver(read);
    observer.observe(el);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [el, doc]);
  return values.el === el ? values.values : {};
}

function PixelInput({ value, placeholder, onCommit }: { value: string; placeholder?: string; onCommit(v: string): void }) {
  return <CommitInput mono value={value} placeholder={placeholder} onCommit={onCommit} />;
}

const GROUPS: OverrideGroup[] = ['Size', 'Spacing', 'Type', 'Colour and border'];
/** Shown on every component; the rest are one pick away in "More…". */
const ALWAYS = new Set(['width', 'height', 'icon-size', 'padding-inline', 'padding-block', 'type', 'font-weight', 'color', 'background-color', 'border-color', 'border-width', 'border-radius']);

function overrideOptions(p: OverrideProperty) {
  switch (p.kind) {
    case 'color':
      return colorPickerOptions([colorCategoryFor(p.key)]);
    case 'space':
      return scalePickerOptions(spaceOptions);
    case 'type':
      return typePickerOptions(typeOptions);
    case 'weight':
      return scalePickerOptions(weightOptions);
    case 'radius':
      return scalePickerOptions(radiusOptions);
    case 'shadow':
      return scalePickerOptions(shadowOptions);
    default:
      return [];
  }
}

/**
 * Size, spacing, type, icon size, colour and border for a component, or for
 * the part of it ⌘-clicked on the canvas. The rows show what the canvas draws
 * now; picking a value overrides it, and every override is a deviation.
 */
function ComponentStyle({ node, inspected, doc, mutate }: { node: ComponentNode; inspected: Element | null; doc: Handover; mutate(fn: (n: ComponentNode) => void): void }) {
  const root = ownElement(inspected, node.id);
  const deepPart = root && inspected && inspected !== root ? partSelector(inspected, root) : null;
  const overrides = node.overrides ?? {};
  const knownParts = [...new Set(Object.keys(overrides).map((k) => splitKey(k).part).filter((p): p is string => !!p))];
  // `undefined` follows the canvas: the ⌘-clicked part, or the component itself.
  const [picked, setPicked] = React.useState<string | undefined>(undefined);
  const part = picked === undefined ? deepPart : picked || null;
  const partEl = (() => {
    if (!root || !part) return root;
    try {
      return root.querySelector(part.startsWith('>') ? `:scope ${part}` : part);
    } catch {
      return null;
    }
  })();
  const measured = useMeasured(partEl, doc);
  const [more, setMore] = React.useState<string[]>([]);
  const parts = [...new Set([...(deepPart ? [deepPart] : []), ...knownParts])];

  const set = (property: string, value: string | null) =>
    mutate((n) => {
      const key = joinKey(part, property);
      const next = { ...n.overrides };
      if (value) next[key] = value;
      else delete next[key];
      if (Object.keys(next).length) n.overrides = next;
      else delete n.overrides;
    });

  const hasIcon = !!partEl?.querySelector('svg') || partEl?.tagName.toLowerCase() === 'svg';
  const rows = OVERRIDE_PROPERTIES.filter((p) => {
    if (overrides[joinKey(part, p.key)]) return true;
    if (p.key === 'icon-size' && !hasIcon) return false;
    return ALWAYS.has(p.key) || more.includes(p.key);
  });
  const hidden = OVERRIDE_PROPERTIES.filter((p) => !rows.includes(p) && (p.key !== 'icon-size' || hasIcon));
  const count = Object.keys(overrides).length;

  return (
    <div className="section">
      <h3>Style{count ? ` · ${count} override${count === 1 ? '' : 's'}` : ''}</h3>
      <Row label="Styling" title="⌘-click a part of the component on the canvas to style just that part">
        <select className="select" value={part ?? ''} onChange={(e) => setPicked(e.target.value)}>
          <option value="">{node.name}</option>
          {parts.map((p) => (
            <option key={p} value={p}>{p === deepPart ? `${p} (⌘-clicked)` : p}</option>
          ))}
        </select>
      </Row>
      {part && !partEl ? <p className="hint off">That part is not on the canvas now — its overrides still export.</p> : null}
      {GROUPS.map((group) => {
        const list = rows.filter((p) => p.group === group);
        if (!list.length) return null;
        return (
          <div key={group} className="style-group">
            <div className="label-above">{group}</div>
            {list.map((p) => {
              const key = joinKey(part, p.key);
              const value = overrides[key];
              const declared = !part && p.kind === 'color' ? node.tokens?.[p.key]?.split('|')[0].replace(/@(light|dark)$/, '') : undefined;
              const now = measured[p.key];
              return (
                <Row key={p.key} label={p.label} onReset={value ? () => set(p.key, null) : undefined} title={value ? `Override — ${p.label} is ${value}` : `Now ${now ?? '—'}`}>
                  {p.kind === 'size' ? (
                    <PixelInput value={value ?? ''} placeholder={now ? `now ${now}` : 'px'} onCommit={(v) => set(p.key, v.trim() ? toPx(v) : null)} />
                  ) : p.kind === 'icon' || p.kind === 'borderWidth' ? (
                    <select className="select" value={value ?? ''} onChange={(e) => set(p.key, e.target.value || null)}>
                      <option value="">{now ? `now ${now}` : 'default'}</option>
                      {(p.kind === 'icon' ? [12, 14, 16, 18, 20, 24, 28, 32, 40, 48] : [0, 1, 2, 3, 4]).map((v) => <option key={v} value={`${v}px`}>{v}px</option>)}
                    </select>
                  ) : (
                    <Picker value={value ?? declared} display={now ? `now ${now}` : undefined} options={overrideOptions(p)} onPick={(path) => set(p.key, path)} />
                  )}
                  {value ? <span className="badge warn" style={{ marginTop: 4 }}>override</span> : null}
                </Row>
              );
            })}
          </div>
        );
      })}
      {hidden.length ? (
        <select className="select" value="" onChange={(e) => e.target.value && setMore((m) => [...m, e.target.value])}>
          <option value="">More…</option>
          {hidden.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      ) : null}
      <p className="hint">Prefer a prop — a Button’s <span className="mono">size</span> sets its height and padding. Anything changed here reaches the developer as a deviation, so the library can gain the prop.</p>
    </div>
  );
}

// ---------------------------------------------------------------- icons passed as props

type ElementValue = { $element: string; props?: Record<string, unknown>; text?: string };
const isElementValue = (v: unknown): v is ElementValue => !!v && typeof v === 'object' && typeof (v as ElementValue).$element === 'string';

/** An icon passed through a prop (`startIcon`): its glyph, size and weight. */
function IconProp({ value, onChange }: { value: ElementValue | undefined; onChange(v: ElementValue | undefined): void }) {
  const icons = React.useMemo(() => iconNames().map((n) => ({ path: n, label: n.replace(/Icon$/, ''), group: n[0] })), []);
  const props = value?.props ?? {};
  const setProps = (patch: Record<string, unknown>) => {
    if (!value) return;
    const next = { ...props, ...patch };
    for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k];
    onChange({ ...value, props: next });
  };
  return (
    <div className="icon-prop">
      <Picker value={value?.$element} options={icons} placeholder="Add an icon" onPick={(name) => onChange({ $element: name, props: value?.props ?? {} })} />
      {value ? (
        <div className="icon-prop-row">
          <select className="select" value={String(props.size ?? '')} title="Icon size — some components size their icons themselves; use Style → Icon size then" onChange={(e) => setProps({ size: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">size</option>
            {[12, 14, 16, 20, 24, 32].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select" value={String(props.weight ?? '')} onChange={(e) => setProps({ weight: e.target.value || undefined })}>
            <option value="">regular</option>
            {['thin', 'light', 'bold', 'fill', 'duotone'].map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
      ) : null}
    </div>
  );
}
