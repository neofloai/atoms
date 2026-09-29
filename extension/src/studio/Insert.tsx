/**
 * The insert palette: every Atoms component (grouped as the docs group
 * them), the layout primitives, and every icon. A click adds it after the
 * selection, or inside it when the selection is a container; dragging it
 * onto the canvas drops it exactly where the line shows.
 */
import * as React from 'react';
import { metaOf, paletteGroups } from './meta';
import { freshId } from './model';
import { INSERT_TYPE } from './Canvas';
import { REGISTRY, iconComponent, iconNames, loadIcons } from './render';

import type { HandoverNode } from '../shared/schema';

/** A starting point for each component: enough props to render something recognisable. */
const STARTERS: Record<string, { props?: Record<string, unknown>; text?: string }> = {
  Button: { props: { variant: 'primary' }, text: 'Button' },
  IconButton: { props: { 'aria-label': 'Action' } },
  Chip: { props: { label: 'Chip' } },
  Typography: { props: { variant: 'body1' }, text: 'Text' },
  TextField: { props: { placeholder: 'Placeholder', label: 'Label' } },
  Select: { props: { label: 'Label', value: '' } },
  Checkbox: { props: { label: 'Checkbox' } },
  Radio: { props: { label: 'Radio' } },
  Switch: { props: { label: 'Switch' } },
  Alert: { props: { severity: 'info' }, text: 'Something to know.' },
  Avatar: { text: 'AV' },
  Badge: { props: { badgeContent: 3 } },
  Link: { props: { href: '#' }, text: 'Link' },
  Tooltip: { props: { title: 'Tooltip' }, text: 'Hover me' },
  Progress: { props: { value: 60 } },
  Slider: { props: { value: 40 } },
  Skeleton: { props: { width: 160, height: 20 } },
  Tab: { props: { label: 'Tab', value: 'tab' } },
  ToggleButton: { props: { value: 'one' }, text: 'Toggle' },
  MenuItem: { text: 'Menu item' },
  DataGrid: { props: { rows: [{ id: 1, name: 'Row one' }, { id: 2, name: 'Row two' }], columns: [{ field: 'name', headerName: 'Name', flex: 1 }] } },
};

export function starter(name: string): HandoverNode {
  const id = freshId('c');
  if (name === 'Stack (row)' || name === 'Stack (column)') {
    const direction = name.includes('row') ? 'row' : 'column';
    return { kind: 'layout', id: freshId('l'), name: 'Stack', rect: [0, 0, 0, 0], props: { direction }, layout: { display: 'flex', direction }, styles: { gap: { value: '8px', token: 'spacing.component.xs', css: { gap: '8px' } } }, children: [] };
  }
  if (name === 'Box') return { kind: 'layout', id: freshId('l'), name: 'Box', rect: [0, 0, 0, 0], props: {}, styles: { padding: { value: '12px', token: 'spacing.component.sm', css: { padding: '12px' } } }, children: [] };
  const base = STARTERS[name] ?? {};
  const meta = metaOf(name);
  const text = base.text ?? (meta?.children && !base.props?.label ? name : undefined);
  return { kind: 'component', id, name, rect: [0, 0, 0, 0], props: { ...base.props }, ...(text ? { text } : {}) };
}

/** What a palette item carries when dragged: `Button`, or `icon:PlusIcon`. */
export function paletteNode(item: string): HandoverNode {
  if (item.startsWith('icon:')) return { kind: 'icon', id: freshId('i'), name: item.slice(5), props: { size: 20 }, rect: [0, 0, 0, 0] };
  return starter(item);
}

const drag = (item: string) => ({
  draggable: true,
  onDragStart: (e: React.DragEvent) => {
    e.dataTransfer.setData(INSERT_TYPE, item);
    e.dataTransfer.effectAllowed = 'copy';
  },
});

export function Insert({ onInsert }: { onInsert(node: HandoverNode): void }) {
  const [query, setQuery] = React.useState('');
  const [iconsReady, setIconsReady] = React.useState(false);
  const [iconQuery, setIconQuery] = React.useState('');
  React.useEffect(() => {
    void loadIcons().then(() => setIconsReady(true));
  }, []);
  const names = new Set(Object.keys(REGISTRY).filter((n) => !['Box', 'Stack', 'Grid', 'Container'].includes(n)));
  const groups = paletteGroups(names).map((g) => ({ ...g, names: g.names.filter((n) => !query || n.toLowerCase().includes(query.toLowerCase())) })).filter((g) => g.names.length);
  const icons = iconsReady ? iconNames().filter((n) => !iconQuery || n.toLowerCase().includes(iconQuery.toLowerCase())).slice(0, 120) : [];
  return (
    <div className="palette">
      <div className="palette-group">
        <h3>Layout</h3>
        <div className="palette-grid">
          {['Stack (row)', 'Stack (column)', 'Box'].map((n) => (
            <button type="button" key={n} className="palette-item" {...drag(n)} onClick={() => onInsert(starter(n))}>{n}</button>
          ))}
        </div>
      </div>
      <input className="input" placeholder="Search components" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.stopPropagation()} style={{ marginBottom: 12 }} />
      {groups.map((g) => (
        <div className="palette-group" key={g.category}>
          <h3>{g.category}</h3>
          <div className="palette-grid">
            {g.names.map((n) => (
              <button type="button" key={n} className="palette-item" title={metaOf(n)?.tagline} {...drag(n)} onClick={() => onInsert(starter(n))}>{n}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="palette-group">
        <h3>Icons</h3>
        <input className="input" placeholder="Search 1,500 icons" value={iconQuery} onChange={(e) => setIconQuery(e.target.value)} onKeyDown={(e) => e.stopPropagation()} style={{ marginBottom: 8 }} />
        {iconsReady ? (
          <div className="icon-grid">
            {icons.map((name) => {
              const Icon = iconComponent(name);
              return (
                <button type="button" key={name} className="icon-cell" title={name} {...drag(`icon:${name}`)} onClick={() => onInsert(paletteNode(`icon:${name}`))}>
                  {Icon ? <Icon size={18} /> : name.slice(0, 2)}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="hint">Loading icons…</p>
        )}
      </div>
    </div>
  );
}
