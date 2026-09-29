/**
 * The canvas: an iframe the design renders into with the real library,
 * sized to the chosen width, with Studio's selection, hover, drag-and-drop
 * and compare layers drawn over it. Clicks never reach the components —
 * the canvas is for picking and arranging, not for using the screen.
 */
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Overlay } from '../inspector/overlay';
import { acceptsChildren, index, isInside, kidsOf, labelOf } from './model';
import { CanvasRoot, Node } from './render';

import type { Handover } from '../shared/schema';

/** The drag type the Insert palette sets: a component name, or `icon:<Name>`. */
export const INSERT_TYPE = 'application/x-atoms-insert';

export interface Drop {
  parentId: string;
  index: number;
  line: { x: number; y: number; w: number; h: number };
}

export interface CompareSettings {
  mode: 'off' | 'overlay' | 'difference';
  opacity: number;
  image: string | null;
  /** Where the screenshot sits in the design, in CSS pixels. */
  box: { x: number; y: number; w: number; h: number } | null;
}

interface Props {
  doc: Handover;
  mode: 'light' | 'dark';
  width: number;
  zoom: number;
  selected: string | null;
  onSelect(id: string | null): void;
  onMove(id: string, parentId: string, index: number): void;
  onEditText(id: string): void;
  onKey(event: KeyboardEvent): void;
  /** The element the selection measures from: the node's own, or the one ⌘-clicked inside it. */
  onInspect?(el: Element | null): void;
  /** The wheel over the design (a pinch, a two-finger scroll), at a point in Studio's own coordinates. */
  onWheel?(event: WheelEvent, x: number, y: number): void;
  /** A resize handle was dragged: the element, and its new size in CSS pixels. */
  onResize?(el: Element, size: { width?: number; height?: number }): void;
  /** Something dragged from the Insert palette was dropped at a position. */
  onInsertAt?(item: string, parentId: string, index: number): void;
  compare: CompareSettings;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FRAME_CSS = `
html, body { margin: 0; }
#canvas { display: flow-root; }
[data-studio-missing] { display: inline-flex; min-width: 16px; min-height: 16px; outline: 1px dashed #b3b3b3; font: 10px/14px system-ui; color: #888; align-items: center; justify-content: center; }
[data-studio-broken] { display: inline-block; padding: 4px 8px; outline: 1px dashed #e5484d; color: #e5484d; font: 11px/16px system-ui; }
* { cursor: default !important; }
`;

export function Canvas(props: Props) {
  const { doc, mode, width, zoom, compare } = props;
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [frameDoc, setFrameDoc] = React.useState<Document | null>(null);
  const root = React.useRef<Root | null>(null);
  const [height, setHeight] = React.useState(600);
  const measureLayer = React.useRef<HTMLDivElement>(null);
  const handleLayer = React.useRef<HTMLDivElement>(null);
  // What the pointer is over and whether Alt is held, read by the drawing loop.
  const pointer = React.useRef<{ hover: Element | null; deep: Element | null; alt: boolean; dragging: boolean; resizing: boolean }>({ hover: null, deep: null, alt: false, dragging: false, resizing: false });
  // The element the handles resize, kept current by the drawing loop.
  const handleTarget = React.useRef<Element | null>(null);
  const [drop, setDrop] = React.useState<Drop | null>(null);
  const [notes, setNotes] = React.useState<(Box & { n: number })[]>([]);
  // Event handlers attached once read the latest props through this.
  const latest = React.useRef(props);
  React.useLayoutEffect(() => {
    latest.current = props;
  });

  // One document for the life of the canvas; React renders into it as a second root.
  React.useEffect(() => {
    const iframe = frame.current!;
    const d = iframe.contentDocument!;
    d.open();
    d.write(`<!doctype html><html><head><link rel="stylesheet" href="studio.css"><style>${FRAME_CSS}</style></head><body><div id="canvas"></div></body></html>`);
    d.close();
    root.current = createRoot(d.getElementById('canvas')!);
    setFrameDoc(d);
    // The frame is as tall as the design, so the stage scrolls rather than the iframe.
    const content = d.getElementById('canvas')!;
    const observer = new ResizeObserver(() => setHeight(Math.max(40, Math.ceil(content.getBoundingClientRect().height))));
    observer.observe(content);
    return () => {
      observer.disconnect();
      root.current?.unmount();
    };
  }, []);

  React.useEffect(() => {
    if (!frameDoc || !root.current) return;
    root.current.render(
      <CanvasRoot doc={frameDoc} mode={mode}>
        <Node node={doc.tree} />
      </CanvasRoot>,
    );
  }, [frameDoc, doc, mode]);

  // ------------------------------------------------------------ geometry

  const elementOf = React.useCallback(
    (id: string) => frameDoc?.querySelector(`[data-studio-id="${CSS.escape(id)}"]:not([data-studio-replica])`) ?? null,
    [frameDoc],
  );

  const boxOf = (el: Element | null): Box | null => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width || r.height ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
  };

  // The inspector's marks — box model, gaps, size, Alt-hover distances — redrawn
  // whenever what they measure moves (fonts, images, grids measuring themselves, edits).
  React.useEffect(() => {
    const layer = measureLayer.current;
    if (!frameDoc || !layer) return;
    const overlay = new Overlay(layer);
    const names = new WeakMap<Element, string>();
    const nameOf = (el: Element | null) => {
      if (!el) return '';
      const marked = el.closest('[data-studio-id]');
      const node = marked ? index(latest.current.doc.tree).get(marked.getAttribute('data-studio-id')!)?.node : undefined;
      const label = node ? labelOf(node) : '';
      return marked === el ? label : `${label ? `${label} › ` : ''}<${el.tagName.toLowerCase()}>`;
    };
    const cached = (el: Element | null) => {
      if (!el) return '';
      if (!names.has(el)) names.set(el, nameOf(el));
      return names.get(el)!;
    };
    const rect = (el: Element | null) => {
      if (!el?.isConnected) return '-';
      const r = el.getBoundingClientRect();
      return `${r.left},${r.top},${r.width},${r.height}`;
    };
    let raf = 0;
    let last = '';
    let inspected: Element | null = null;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = pointer.current;
      const { selected: id, zoom: scale } = latest.current;
      const own = id ? elementOf(id) : null;
      // A ⌘-clicked element stays the selection while it is still inside the selected node.
      if (p.deep && (!p.deep.isConnected || p.deep.closest('[data-studio-id]')?.getAttribute('data-studio-id') !== id)) p.deep = null;
      const selected = p.deep ?? own;
      if (selected !== inspected) {
        inspected = selected;
        latest.current.onInspect?.(selected);
      }
      const hover = p.dragging || p.resizing ? null : p.hover;
      handleTarget.current = selected && !selected.hasAttribute('data-studio-replica') && selected.closest('[data-studio-replica]') === null ? selected : null;
      if (handleLayer.current) {
        const r = handleTarget.current && !p.dragging ? handleTarget.current.getBoundingClientRect() : null;
        handleLayer.current.style.display = r && (r.width || r.height) ? '' : 'none';
        if (r) Object.assign(handleLayer.current.style, { left: `${r.left * scale}px`, top: `${r.top * scale}px`, width: `${r.width * scale}px`, height: `${r.height * scale}px` });
      }
      const kids = selected ? Array.from(selected.children).slice(0, 60).map(rect).join(';') : '';
      const key = [id, rect(selected), kids, rect(hover), p.alt, scale, p.dragging].join('|');
      if (key === last) return;
      last = key;
      // An edit can change a node's name without moving it.
      if (hover) names.delete(hover);
      if (selected) names.delete(selected);
      overlay.draw({
        selected: p.dragging ? null : selected,
        selectedName: cached(selected),
        hover,
        hoverName: cached(hover),
        measuring: p.alt,
        scale,
        // The stage leaves a margin above the canvas, so a label at the top edge sits outside the design.
        roomAbove: 32,
      });
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      layer.replaceChildren();
    };
  }, [frameDoc, elementOf]);

  // Note badges, recomputed when the design changes.
  React.useEffect(() => {
    if (!frameDoc) return;
    const t = setTimeout(() => {
      const out: (Box & { n: number })[] = [];
      let n = 0;
      for (const { node } of index(doc.tree).values()) {
        if (node.kind === 'text' || node.kind === 'repeat' || !node.note) continue;
        n += 1;
        const b = boxOf(elementOf(node.id));
        if (b) out.push({ ...b, n });
      }
      setNotes(out);
    }, 100);
    return () => clearTimeout(t);
  }, [frameDoc, doc, elementOf, height, width]);

  // ------------------------------------------------------------ resizing

  // Drag an edge or the corner: the element follows live, and the size is committed on release.
  const startResize = (e: React.PointerEvent, axis: 'x' | 'y' | 'xy') => {
    const el = handleTarget.current as HTMLElement | null;
    if (!el || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const handle = e.currentTarget as HTMLElement;
    handle.setPointerCapture(e.pointerId);
    const start = el.getBoundingClientRect();
    const saved = el.getAttribute('style');
    const x0 = e.clientX;
    const y0 = e.clientY;
    let size: { width?: number; height?: number } = {};
    pointer.current.resizing = true;
    const move = (ev: PointerEvent) => {
      const z = latest.current.zoom;
      // Shift snaps to the 4px grid the spacing scale is built on.
      const snap = (v: number) => Math.max(1, ev.shiftKey ? Math.round(v / 4) * 4 : Math.round(v));
      size = {
        ...(axis !== 'y' ? { width: snap(start.width + (ev.clientX - x0) / z) } : {}),
        ...(axis !== 'x' ? { height: snap(start.height + (ev.clientY - y0) / z) } : {}),
      };
      for (const [k, v] of Object.entries(size)) {
        el.style.setProperty(k, `${v}px`, 'important');
        el.style.setProperty(`min-${k}`, `${v}px`, 'important');
        el.style.setProperty(`max-${k}`, `${v}px`, 'important');
      }
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      pointer.current.resizing = false;
      if (saved === null) el.removeAttribute('style');
      else el.setAttribute('style', saved);
      if (Object.keys(size).length) latest.current.onResize?.(el, size);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };

  // ------------------------------------------------------------ interaction

  React.useEffect(() => {
    if (!frameDoc) return;
    let pressed: { id: string; x: number; y: number } | null = null;
    let dragging = false;
    let pendingDrop: Drop | null = null;

    // The canvas is another window: its nodes are not instances of this window's Element.
    const markedAt = (target: EventTarget | null) => (target && 'closest' in target ? (target as Element).closest('[data-studio-id]') : null);
    const idAt = (target: EventTarget | null) => markedAt(target)?.getAttribute('data-studio-id') ?? null;

    const p = pointer.current;
    const onMove = (e: PointerEvent) => {
      p.alt = e.altKey;
      if (pressed && !dragging && Math.hypot(e.clientX - pressed.x, e.clientY - pressed.y) > 4 && pressed.id !== latest.current.doc.tree.id) {
        dragging = true;
        p.dragging = true;
      }
      if (dragging && pressed) {
        pendingDrop = dropAt(frameDoc, latest.current.doc, pressed.id, e.clientX, e.clientY);
        setDrop(pendingDrop);
        return;
      }
      // With ⌘ held the exact element under the pointer, as in the inspector.
      const deep = (e.metaKey || e.ctrlKey) && e.target && 'closest' in e.target ? (e.target as Element) : null;
      p.hover = deep ?? markedAt(e.target);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const id = idAt(e.target);
      const target = e.target && 'closest' in e.target ? (e.target as Element) : null;
      p.deep = (e.metaKey || e.ctrlKey) && target && target !== markedAt(target) ? target : null;
      latest.current.onSelect(id);
      pressed = id ? { id, x: e.clientX, y: e.clientY } : null;
      dragging = false;
    };

    const onUp = () => {
      if (dragging && pressed && pendingDrop) latest.current.onMove(pressed.id, pendingDrop.parentId, pendingDrop.index);
      pressed = null;
      dragging = false;
      p.dragging = false;
      pendingDrop = null;
      setDrop(null);
    };

    const swallow = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDouble = (e: MouseEvent) => {
      swallow(e);
      const id = idAt(e.target);
      if (id) latest.current.onEditText(id);
    };
    const onKey = (e: KeyboardEvent) => {
      p.alt = e.altKey;
      latest.current.onKey(e);
    };
    // The design is another document, so its wheel events never reach the stage: forward them.
    const onWheel = (e: WheelEvent) => {
      const r = frame.current!.getBoundingClientRect();
      const z = latest.current.zoom;
      latest.current.onWheel?.(e, r.left + e.clientX * z, r.top + e.clientY * z);
    };
    // Alt is read wherever focus is: the canvas, or Studio's own panels.
    const onOuterKey = (e: KeyboardEvent) => {
      p.alt = e.altKey;
    };
    const onBlur = () => {
      p.alt = false;
    };
    const onLeave = () => {
      p.hover = null;
    };

    // Dragging from the Insert palette: the same drop line as moving a node.
    const fromPalette = (e: DragEvent) => !!e.dataTransfer?.types.includes(INSERT_TYPE);
    const onDragOver = (e: DragEvent) => {
      if (!fromPalette(e)) return;
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
      pendingDrop = dropAt(frameDoc, latest.current.doc, '', e.clientX, e.clientY);
      setDrop(pendingDrop);
    };
    const onDragLeave = (e: DragEvent) => {
      if (!e.relatedTarget) setDrop(null);
    };
    const onDrop = (e: DragEvent) => {
      if (!fromPalette(e)) return;
      e.preventDefault();
      const item = e.dataTransfer!.getData(INSERT_TYPE);
      const at = dropAt(frameDoc, latest.current.doc, '', e.clientX, e.clientY) ?? pendingDrop;
      setDrop(null);
      pendingDrop = null;
      if (item && at) latest.current.onInsertAt?.(item, at.parentId, at.index);
    };

    frameDoc.addEventListener('pointermove', onMove, true);
    frameDoc.addEventListener('pointerdown', onDown, true);
    frameDoc.addEventListener('pointerup', onUp, true);
    frameDoc.addEventListener('click', swallow, true);
    frameDoc.addEventListener('dblclick', onDouble, true);
    frameDoc.addEventListener('submit', swallow, true);
    frameDoc.addEventListener('keydown', onKey, true);
    frameDoc.addEventListener('keyup', onKey, true);
    frameDoc.addEventListener('wheel', onWheel, { capture: true, passive: false });
    frameDoc.addEventListener('dragover', onDragOver, true);
    frameDoc.addEventListener('dragleave', onDragLeave, true);
    frameDoc.addEventListener('drop', onDrop, true);
    document.addEventListener('keydown', onOuterKey, true);
    document.addEventListener('keyup', onOuterKey, true);
    window.addEventListener('blur', onBlur);
    frameDoc.addEventListener('mousedown', swallow, true);
    frameDoc.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      frameDoc.removeEventListener('pointermove', onMove, true);
      frameDoc.removeEventListener('pointerdown', onDown, true);
      frameDoc.removeEventListener('pointerup', onUp, true);
      frameDoc.removeEventListener('click', swallow, true);
      frameDoc.removeEventListener('dblclick', onDouble, true);
      frameDoc.removeEventListener('submit', swallow, true);
      frameDoc.removeEventListener('keydown', onKey, true);
      frameDoc.removeEventListener('keyup', onKey, true);
      frameDoc.removeEventListener('wheel', onWheel, true);
      frameDoc.removeEventListener('dragover', onDragOver, true);
      frameDoc.removeEventListener('dragleave', onDragLeave, true);
      frameDoc.removeEventListener('drop', onDrop, true);
      document.removeEventListener('keydown', onOuterKey, true);
      document.removeEventListener('keyup', onOuterKey, true);
      window.removeEventListener('blur', onBlur);
      frameDoc.removeEventListener('mousedown', swallow, true);
      frameDoc.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [frameDoc]);

  return (
    <div className="canvas-frame" style={{ width: width * zoom, height: height * zoom }}>
      <div className="canvas-scale" style={{ width, height, transform: `scale(${zoom})` }}>
        <iframe ref={frame} className="canvas-iframe" title="Design" style={{ width, height }} />
        <div className="canvas-overlay">
          {compare.mode !== 'off' && compare.image && compare.box ? (
            <img
              className="compare-image"
              src={compare.image}
              alt=""
              style={{
                left: compare.box.x,
                top: compare.box.y,
                width: compare.box.w,
                height: compare.box.h,
                opacity: compare.mode === 'difference' ? 1 : compare.opacity,
                mixBlendMode: compare.mode === 'difference' ? 'difference' : 'normal',
              }}
            />
          ) : null}
          {drop ? <div className="ov-drop" style={{ left: drop.line.x, top: drop.line.y, width: drop.line.w, height: drop.line.h }} /> : null}
          {notes.map((b) => (
            <div key={b.n} className="ov-note" style={{ left: b.x + b.w - 8, top: b.y - 8 }}>
              {b.n}
            </div>
          ))}
        </div>
      </div>
      {/* Outside the zoom, so labels keep their size; the overlay scales positions itself. */}
      <div ref={measureLayer} className="measure-layer" />
      <div ref={handleLayer} className="resize-layer" style={{ display: 'none' }}>
        <div className="resize-handle rh-x" title="Drag to change the width (Shift snaps to 4px)" onPointerDown={(e) => startResize(e, 'x')} />
        <div className="resize-handle rh-y" title="Drag to change the height (Shift snaps to 4px)" onPointerDown={(e) => startResize(e, 'y')} />
        <div className="resize-handle rh-xy" title="Drag to change the size (Shift snaps to 4px)" onPointerDown={(e) => startResize(e, 'xy')} />
      </div>
    </div>
  );
}

/**
 * Where a dragged node would land: inside a container when the pointer is
 * well within it, otherwise before or after the node under the pointer,
 * along its parent's direction.
 */
function dropAt(d: Document, doc: Handover, dragId: string, x: number, y: number): Drop | null {
  const hit = d.elementFromPoint(x, y)?.closest('[data-studio-id]');
  const id = hit?.getAttribute('data-studio-id');
  if (!hit || !id || id === dragId || isInside(doc.tree, dragId, id)) return null;
  const map = index(doc.tree);
  const at = map.get(id);
  if (!at) return null;
  const r = hit.getBoundingClientRect();
  const edge = Math.min(10, r.width / 4, r.height / 4);
  const inner = x > r.left + edge && x < r.right - edge && y > r.top + edge && y < r.bottom - edge;

  const elementOf = (nodeId: string | undefined) =>
    nodeId ? d.querySelector(`[data-studio-id="${CSS.escape(nodeId)}"]:not([data-studio-replica])`) : null;
  const horizontal = (el: Element | null) => {
    if (!el) return false;
    const s = getComputedStyle(el);
    return /flex/.test(s.display) && s.flexDirection.startsWith('row');
  };

  if (acceptsChildren(at.node) && inner) {
    const kids = (kidsOf(at.node) ?? []).filter((k) => k.id !== dragId);
    const row = horizontal(hit);
    let position = kids.length;
    let line = { x: r.left + 4, y: r.bottom - 6, w: r.width - 8, h: 2 };
    for (let i = 0; i < kids.length; i += 1) {
      const b = elementOf(kids[i].id)?.getBoundingClientRect();
      if (!b) continue;
      const before = row ? x < b.left + b.width / 2 : y < b.top + b.height / 2;
      if (before) {
        position = (kidsOf(at.node) ?? []).indexOf(kids[i]);
        line = row ? { x: b.left - 2, y: b.top, w: 2, h: b.height } : { x: b.left, y: b.top - 2, w: b.width, h: 2 };
        break;
      }
      line = row ? { x: b.right, y: b.top, w: 2, h: b.height } : { x: b.left, y: b.bottom, w: b.width, h: 2 };
    }
    return { parentId: at.node.id!, index: position, line };
  }

  if (!at.parent?.id) return null;
  const row = horizontal(elementOf(at.parent.id) ?? hit.parentElement);
  const after = row ? x > r.left + r.width / 2 : y > r.top + r.height / 2;
  const line = row
    ? { x: after ? r.right : r.left - 2, y: r.top, w: 2, h: r.height }
    : { x: r.left, y: after ? r.bottom : r.top - 2, w: r.width, h: 2 };
  return { parentId: at.parent.id, index: at.index + (after ? 1 : 0), line };
}
