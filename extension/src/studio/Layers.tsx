/**
 * The layers tree: every node of the design, collapsible, selectable, and
 * draggable — onto a row's upper or lower edge to go before or after it,
 * onto its middle to go inside it.
 */
import * as React from 'react';
import { acceptsChildren, index, isInside, kidsOf, labelOf } from './model';

import type { Handover, HandoverNode } from '../shared/schema';

interface Props {
  doc: Handover;
  selected: string | null;
  deviating: Set<string>;
  onSelect(id: string): void;
  onMove(id: string, parentId: string, index: number): void;
}

const GLYPH: Record<HandoverNode['kind'], string> = { component: '◆', layout: '▦', element: '▢', icon: '✦', text: 'T', repeat: '≡' };

export function Layers({ doc, selected, deviating, onSelect, onMove }: Props) {
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [drag, setDrag] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<{ id: string; where: 'before' | 'after' | 'in' } | null>(null);
  const map = React.useMemo(() => index(doc.tree), [doc]);

  // A new selection opens every ancestor, so its row is visible…
  const [revealed, setRevealed] = React.useState<string | null>(null);
  if (selected && selected !== revealed) {
    setRevealed(selected);
    const open = new Set(collapsed);
    for (let at = map.get(selected)?.parent; at; at = at.id ? map.get(at.id)?.parent ?? null : null) if (at.id) open.delete(at.id);
    if (open.size !== collapsed.size) setCollapsed(open);
  }
  // …and scrolls to it.
  React.useEffect(() => {
    if (!selected) return;
    const raf = requestAnimationFrame(() => document.querySelector(`.tree-row[data-id="${CSS.escape(selected)}"]`)?.scrollIntoView({ block: 'nearest' }));
    return () => cancelAnimationFrame(raf);
  }, [selected]);

  const rows: React.ReactNode[] = [];
  const visit = (node: HandoverNode, depth: number) => {
    if (node.kind === 'component' && node.renderedBy) return;
    const id = node.id!;
    const kids = (kidsOf(node) ?? []).filter((k) => !(k.kind === 'component' && k.renderedBy));
    const open = !collapsed.has(id);
    const note = node.kind !== 'text' && node.kind !== 'repeat' && !!node.note;
    rows.push(
      <div
        key={id}
        data-id={id}
        className={`tree-row${selected === id ? ' sel' : ''}${over?.id === id ? ` drop-${over.where}` : ''}`}
        style={{ paddingLeft: 6 + depth * 12 }}
        draggable={depth > 0}
        onClick={() => onSelect(id)}
        onDragStart={(e) => {
          setDrag(id);
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', id);
        }}
        onDragEnd={() => {
          setDrag(null);
          setOver(null);
        }}
        onDragOver={(e) => {
          if (!drag || drag === id || isInside(doc.tree, drag, id)) return;
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          const y = (e.clientY - r.top) / r.height;
          const where = acceptsChildren(node) && y > 0.3 && y < 0.7 ? 'in' : y < 0.5 ? 'before' : 'after';
          setOver({ id, where });
        }}
        onDragLeave={() => setOver((o) => (o?.id === id ? null : o))}
        onDrop={(e) => {
          e.preventDefault();
          if (!drag || !over) return;
          const at = map.get(id)!;
          if (over.where === 'in') onMove(drag, id, (kidsOf(node) ?? []).length);
          else if (at.parent?.id) onMove(drag, at.parent.id, at.index + (over.where === 'after' ? 1 : 0));
          setDrag(null);
          setOver(null);
        }}
      >
        <span
          className="caret"
          onClick={(e) => {
            e.stopPropagation();
            const next = new Set(collapsed);
            if (open) next.add(id);
            else next.delete(id);
            setCollapsed(next);
          }}
        >
          {kids.length ? (open ? '▾' : '▸') : ''}
        </span>
        <span className={`kind ${node.kind}`}>{GLYPH[node.kind]}</span>
        <span className="name">{labelOf(node)}</span>
        {'region' in node && node.region ? <span className="tag">{node.region}</span> : null}
        {deviating.has(id) ? <span className="dot dot-dev" title="Has deviations" /> : note ? <span className="dot dot-note" title="Has a note" /> : null}
      </div>,
    );
    if (open) for (const kid of kids) visit(kid, depth + 1);
  };
  visit(doc.tree, 0);
  return <div className="tree">{rows}</div>;
}
