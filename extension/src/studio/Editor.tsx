/**
 * One screen open for editing: layers and the insert palette on the left,
 * the canvas in the middle, the selection's design, the deviations and the
 * handover on the right. Every edit goes through `update`, which records
 * undo history and saves to IndexedDB a moment later.
 */
import * as React from 'react';
import { asset, get, put, type Project, type Screen } from '../shared/db';
import { Canvas, type CompareSettings } from './Canvas';
import { DesignPanel } from './DesignPanel';
import { Deviations } from './Deviations';
import { Inspect } from './Inspect';
import { ExportPanel } from './ExportPanel';
import { sizeStyle } from './DesignPanel';
import { Insert, paletteNode } from './Insert';
import { Layers } from './Layers';
import {
  apply,
  cloneWithNewIds,
  duplicateNode,
  find,
  index,
  insertAt,
  insertNode,
  liveDeviations,
  moveNode,
  redo,
  removeNode,
  setStyle,
  undo,
  upgrade,
  type History,
} from './model';
import { joinKey, partSelector } from './overrides';
import { rasterize } from './rasterize';
import { loadIcons } from './render';
import { Button, Toast } from './ui';

import type { Handover, HandoverNode } from '../shared/schema';

const WIDTHS = [1440, 1280, 1024, 768, 390];
const ZOOMS = [0.25, 0.5, 0.75, 1, 1.5, 2, 4];
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;

export function Editor({ id, go }: { id: string; go(path: string): void }) {
  const [screen, setScreen] = React.useState<Screen | null>(null);
  const [project, setProject] = React.useState<Project | null>(null);
  const [missing, setMissing] = React.useState(false);
  const [history, setHistory] = React.useState<History | null>(null);
  const historyRef = React.useRef<History | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [left, setLeft] = React.useState<'layers' | 'insert'>('layers');
  const [right, setRight] = React.useState<'design' | 'inspect' | 'deviations' | 'handover'>('design');
  const [inspected, setInspected] = React.useState<Element | null>(null);
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [width, setWidth] = React.useState(1440);
  const [zoom, setZoom] = React.useState<number | 'fit'>('fit');
  const [compare, setCompare] = React.useState<CompareSettings>({ mode: 'off', opacity: 0.5, image: null, box: null });
  const [side, setSide] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; error?: boolean } | null>(null);
  const [focusText, setFocusText] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const clipboard = React.useRef<HandoverNode | null>(null);
  const stage = React.useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = React.useState(1000);
  // Space held: the stage pans instead of selecting, like a design tool's hand.
  const [panning, setPanning] = React.useState(false);
  const [grabbing, setGrabbing] = React.useState(false);
  const pan = React.useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  // The stage is a free canvas: the design sits at `offset` inside it and moves by transform, not by scrolling.
  const inner = React.useRef<HTMLDivElement>(null);
  const offset = React.useRef({ x: 0, y: 0 });

  /** Moves the design to `offset`, keeping at least a corner of it on the stage. */
  const place = React.useCallback((x: number, y: number) => {
    const el = stage.current;
    const content = inner.current;
    if (!el || !content) return;
    const keepX = Math.min(120, content.offsetWidth);
    const keepY = Math.min(120, content.offsetHeight);
    const next = {
      x: Math.min(el.clientWidth - keepX, Math.max(keepX - content.offsetWidth, x)),
      y: Math.min(el.clientHeight - keepY, Math.max(keepY - content.offsetHeight, y)),
    };
    offset.current = next;
    content.style.transform = `translate(${next.x}px, ${next.y}px)`;
  }, []);

  const fit = Math.min(1, (stageWidth - 64) / width);
  const scale = zoom === 'fit' ? fit : zoom;
  // The canvas's own zoom: side by side draws it at half size next to the screenshot.
  const canvasScale = side ? scale * 0.5 : scale;
  const scaleRef = React.useRef(canvasScale);
  const zoomRef = React.useRef(scale);
  const anchor = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  /** Zooms to `next`, keeping the design point under (x, y) — the pointer, or the stage's centre — where it is. */
  const zoomTo = React.useCallback((next: number | 'fit' | ((current: number) => number), x?: number, y?: number) => {
    const el = stage.current;
    const frame = el?.querySelector('.canvas-frame');
    if (el && frame) {
      const r = frame.getBoundingClientRect();
      const s = el.getBoundingClientRect();
      const cx = x ?? s.left + s.width / 2;
      const cy = y ?? s.top + s.height / 2;
      anchor.current = { x: cx, y: cy, px: (cx - r.left) / scaleRef.current, py: (cy - r.top) / scaleRef.current };
    }
    setZoom((current) => {
      if (next === 'fit') return 'fit';
      const from = current === 'fit' ? zoomRef.current : current;
      const value = typeof next === 'function' ? next(from) : next;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 1000) / 1000));
    });
  }, []);

  // After a zoom, move the design so the anchored point is back under the pointer. Fit centres it.
  React.useLayoutEffect(() => {
    scaleRef.current = canvasScale;
    zoomRef.current = scale;
    const a = anchor.current;
    const el = stage.current;
    const frame = el?.querySelector('.canvas-frame');
    anchor.current = null;
    if (!el || !frame || !inner.current) return;
    if (zoom === 'fit') {
      place(Math.max(0, (el.clientWidth - inner.current.offsetWidth) / 2), 0);
      return;
    }
    if (!a) return;
    const r = frame.getBoundingClientRect();
    place(offset.current.x - (r.left + a.px * canvasScale - a.x), offset.current.y - (r.top + a.py * canvasScale - a.y));
  }, [canvasScale, scale, zoom, stageWidth, ready, place]);

  /**
   * The wheel over the stage or the design. A trackpad pinch arrives as a wheel event
   * with ctrlKey (as does ⌘ / Ctrl + a mouse wheel) and zooms at the pointer; a
   * two-finger scroll, or a mouse wheel (Shift for sideways), pans.
   */
  const onWheel = React.useCallback(
    (e: WheelEvent, x: number, y: number) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : 1;
      if (e.ctrlKey || e.metaKey) {
        const dy = Math.max(-50, Math.min(50, e.deltaY * unit));
        zoomTo((z) => z * Math.exp(-dy / 100), x, y);
        return;
      }
      const sideways = e.shiftKey && !e.deltaX;
      const dx = (sideways ? e.deltaY : e.deltaX) * unit;
      const dy = sideways ? 0 : e.deltaY * unit;
      place(offset.current.x - dx, offset.current.y - dy);
    },
    [zoomTo, place],
  );

  // ------------------------------------------------------------ load

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadIcons();
      const s = await get<Screen>('screens', id);
      if (cancelled) return;
      if (!s) {
        setMissing(true);
        return;
      }
      const doc = upgrade(s.doc);
      const record = { ...s, doc, original: upgrade(s.original) };
      setScreen(record);
      setProject((await get<Project>('projects', s.projectId)) ?? null);
      const h = { doc, past: [], future: [] };
      historyRef.current = h;
      setHistory(h);
      setMode(doc.source.mode);
      setWidth(doc.scope.kind === 'screen' ? doc.source.viewport.width : Math.max(320, doc.scope.size.width));
      const image = await asset(s.imageId);
      if (image) {
        const box = s.imageBox ?? (doc.scope.kind === 'screen' ? { x: 0, y: 0, w: doc.source.viewport.width, h: doc.source.viewport.height } : { x: 0, y: 0, w: doc.scope.size.width, h: doc.scope.size.height });
        setCompare((c) => ({ ...c, image: URL.createObjectURL(image), box }));
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  React.useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setStageWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  // Save a moment after the last edit. Unsaved while the stored doc lags the edited one.
  React.useEffect(() => {
    if (!screen || !history || history.doc === screen.doc) return;
    const t = setTimeout(() => {
      const next = { ...screen, doc: history.doc, updatedAt: Date.now() };
      void put('screens', next).then(() => setScreen(next));
    }, 400);
    return () => clearTimeout(t);
  }, [history, screen]);

  // ------------------------------------------------------------ edits

  const update = React.useCallback((change: (doc: Handover) => void) => {
    const current = historyRef.current;
    if (!current) return;
    const next = apply(current, change);
    historyRef.current = next;
    setHistory(next);
  }, []);

  const replace = (fn: (h: History) => History) => {
    if (!historyRef.current) return;
    const next = fn(historyRef.current);
    historyRef.current = next;
    setHistory(next);
  };

  const onMove = React.useCallback((node: string, parent: string, position: number) => update((d) => moveNode(d, node, parent, position)), [update]);

  // A resize handle was released: a component's size is an override (on the part it was ⌘-clicked on),
  // a layout's or element's is its own style, and an icon's is its size prop.
  const onResize = React.useCallback(
    (el: Element, size: { width?: number; height?: number }) => {
      const root = el.closest('[data-studio-id]');
      const nodeId = root?.getAttribute('data-studio-id');
      if (!root || !nodeId) return;
      update((d) => {
        const n = find(d, nodeId)?.node;
        if (!n) return;
        if (n.kind === 'component') {
          const part = partSelector(el, root);
          const next = { ...n.overrides };
          for (const [k, v] of Object.entries(size)) next[joinKey(part, k)] = `${v}px`;
          n.overrides = next;
        } else if (n.kind === 'icon') {
          n.props.size = Math.max(size.width ?? 0, size.height ?? 0);
        } else if (n.kind === 'layout' || n.kind === 'element') {
          for (const [k, v] of Object.entries(size)) setStyle(d, nodeId, k, sizeStyle(k, String(v)));
        }
      });
    },
    [update],
  );

  const onInsertAt = React.useCallback(
    (item: string, parentId: string, position: number) => {
      const node = paletteNode(item);
      update((d) => {
        insertAt(d, node, parentId, position);
      });
      setSelected(node.id ?? null);
    },
    [update],
  );

  const insert = (node: HandoverNode) => {
    update((d) => {
      insertNode(d, node, selected);
    });
    setSelected(node.id ?? null);
  };

  const onKey = React.useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPanning(e.type === 'keydown');
        return;
      }
      if (e.type !== 'keydown') return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomTo((z) => z * 1.25);
        return;
      }
      if (mod && e.key === '-') {
        e.preventDefault();
        zoomTo((z) => z / 1.25);
        return;
      }
      if (mod && e.key === '0') {
        e.preventDefault();
        zoomTo(1);
        return;
      }
      if (e.shiftKey && e.code === 'Digit1') {
        e.preventDefault();
        zoomTo('fit');
        return;
      }
      const doc = historyRef.current?.doc;
      if (!doc) return;
      const at = selected ? find(doc, selected) : undefined;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        replace(e.shiftKey ? redo : undo);
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        replace(redo);
        return;
      }
      if (!at) return;
      const nodeId = at.node.id!;
      if ((e.key === 'Backspace' || e.key === 'Delete') && at.parent) {
        e.preventDefault();
        update((d) => removeNode(d, nodeId));
        setSelected(at.parent.id ?? null);
      } else if (mod && e.key.toLowerCase() === 'd' && at.parent) {
        e.preventDefault();
        let next: string | null = null;
        update((d) => {
          next = duplicateNode(d, nodeId);
        });
        setSelected(next);
      } else if (mod && e.key.toLowerCase() === 'c') {
        clipboard.current = structuredClone(at.node);
      } else if (mod && e.key.toLowerCase() === 'v' && clipboard.current) {
        e.preventDefault();
        const copy = cloneWithNewIds(clipboard.current);
        update((d) => {
          insertNode(d, copy, nodeId);
        });
        setSelected(copy.id ?? null);
      } else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowLeft') && at.parent && at.index > 0) {
        e.preventDefault();
        update((d) => moveNode(d, nodeId, at.parent!.id!, at.index - 1));
      } else if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowRight') && at.parent) {
        e.preventDefault();
        update((d) => moveNode(d, nodeId, at.parent!.id!, at.index + 2));
      } else if (e.key === 'Escape') {
        setSelected(at.parent?.id ?? null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setFocusText((n) => n + 1);
        setRight('design');
      }
    },
    [selected, update, zoomTo],
  );

  React.useEffect(() => {
    const stop = () => setPanning(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('blur', stop);
    };
  }, [onKey]);

  // Non-passive, so a pinch never zooms the whole Studio page.
  React.useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const listener = (e: WheelEvent) => onWheel(e, e.clientX, e.clientY);
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, [ready, onWheel]);

  const deviating = React.useMemo(() => {
    const set = new Set<string>();
    if (history) for (const d of liveDeviations(history.doc)) if (!d.resolution) for (const n of d.nodes) set.add(n);
    return set;
  }, [history]);

  // ------------------------------------------------------------ image of the design

  /** The whole edited design as a PNG, drawn from the canvas document. */
  const capture = async (): Promise<Blob> => {
    const iframe = document.querySelector('.canvas-iframe') as HTMLIFrameElement | null;
    const frameDoc = iframe?.contentDocument;
    if (!iframe || !frameDoc) throw new Error('No canvas.');
    return rasterize(frameDoc, iframe.offsetWidth, iframe.offsetHeight);
  };

  // ------------------------------------------------------------ render

  if (missing) {
    return (
      <div className="home">
        <h1>Screen not found</h1>
        <p className="home-lede">It may have been deleted.</p>
        <Button className="solid" onClick={() => go('/')}>All projects</Button>
      </div>
    );
  }
  if (!screen || !history || !ready) return <div className="home muted">Loading…</div>;

  const doc = history.doc;
  const nodeCount = index(doc.tree).size;

  return (
    <div className="editor">
      <div className="topbar">
        <Button onClick={() => go('/')} title="All projects">← {project?.name ?? 'Projects'}</Button>
        <span className="sep" />
        <input
          className="title"
          defaultValue={screen.name}
          key={screen.name}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          onBlur={(e) => {
            const name = e.target.value.trim();
            if (name && name !== screen.name) {
              const next = { ...screen, name, doc: historyRef.current!.doc };
              setScreen(next);
              void put('screens', next);
            }
          }}
        />
        <span className="status">{history.doc === screen.doc ? 'Saved' : 'Saving…'}</span>
        <span className="spacer" />
        <Button className="icon" title="Undo (⌘Z)" disabled={!history.past.length} onClick={() => replace(undo)}>↶</Button>
        <Button className="icon" title="Redo (⇧⌘Z)" disabled={!history.future.length} onClick={() => replace(redo)}>↷</Button>
        <span className="sep" />
        <div className="seg" title="Colour mode of the design">
          {(['light', 'dark'] as const).map((m) => (
            <Button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{m === 'light' ? 'Light' : 'Dark'}</Button>
          ))}
        </div>
        <select className="select" style={{ width: 110 }} value={String(width)} title="Canvas width — the design responds as it would in a window this wide" onChange={(e) => setWidth(Number(e.target.value))}>
          {[...new Set([width, ...WIDTHS])].sort((a, b) => b - a).map((w) => <option key={w} value={w}>{w}px</option>)}
        </select>
        <div className="seg zoom" title="Zoom — pinch the trackpad, or ⌘ + scroll">
          <Button className="icon" title="Zoom out (⌘ −)" onClick={() => zoomTo((z) => z / 1.25)}>−</Button>
          <select className="select" value={String(zoom)} onChange={(e) => zoomTo(e.target.value === 'fit' ? 'fit' : Number(e.target.value))}>
            <option value="fit">{zoom === 'fit' ? `Fit · ${Math.round(scale * 100)}%` : 'Fit (⇧1)'}</option>
            {[...new Set([...ZOOMS, ...(zoom === 'fit' ? [] : [zoom])])].sort((a, b) => a - b).map((z) => (
              <option key={z} value={z}>{Math.round(z * 100)}%{z === 1 ? ' (⌘0)' : ''}</option>
            ))}
          </select>
          <Button className="icon" title="Zoom in (⌘ +)" onClick={() => zoomTo((z) => z * 1.25)}>+</Button>
        </div>
        <span className="sep" />
        <div className="seg" title="Compare with the screenshot taken at capture">
          <Button className={compare.mode === 'off' && !side ? 'on' : ''} onClick={() => { setSide(false); setCompare((c) => ({ ...c, mode: 'off' })); }}>Design</Button>
          <Button className={compare.mode === 'overlay' ? 'on' : ''} disabled={!compare.image} onClick={() => { setSide(false); setCompare((c) => ({ ...c, mode: 'overlay' })); }}>Overlay</Button>
          <Button className={compare.mode === 'difference' ? 'on' : ''} disabled={!compare.image} onClick={() => { setSide(false); setCompare((c) => ({ ...c, mode: 'difference' })); }}>Difference</Button>
          <Button className={side ? 'on' : ''} disabled={!compare.image} onClick={() => { setSide(true); setCompare((c) => ({ ...c, mode: 'off' })); }}>Side by side</Button>
        </div>
        {compare.mode === 'overlay' ? (
          <input type="range" min={0} max={1} step={0.05} value={compare.opacity} title="Screenshot opacity" onChange={(e) => setCompare((c) => ({ ...c, opacity: Number(e.target.value) }))} />
        ) : null}
      </div>
      <div className="workspace">
        <div className="side">
          <div className="tabs">
            <Button className={left === 'layers' ? 'on' : ''} onClick={() => setLeft('layers')}>Layers</Button>
            <Button className={left === 'insert' ? 'on' : ''} onClick={() => setLeft('insert')}>Insert</Button>
            <span className="muted" style={{ marginLeft: 'auto', alignSelf: 'center' }}>{nodeCount} nodes</span>
          </div>
          <div className="pane">
            {left === 'layers' ? (
              <Layers doc={doc} selected={selected} deviating={deviating} onSelect={setSelected} onMove={onMove} />
            ) : (
              <Insert onInsert={insert} />
            )}
          </div>
        </div>
        <div
          className={`stage${panning ? ' panning' : ''}${grabbing ? ' grabbing' : ''}`}
          ref={stage}
          onPointerDown={(e) => {
            const el = e.currentTarget;
            // Space + drag, or the middle button, pans.
            if (panning || e.button === 1) {
              e.preventDefault();
              el.setPointerCapture(e.pointerId);
              pan.current = { x: e.clientX, y: e.clientY, left: offset.current.x, top: offset.current.y };
              setGrabbing(true);
              return;
            }
            // A click on the stage around the design clears the selection.
            if (!(e.target as HTMLElement).closest('.canvas-frame, .shot')) setSelected(null);
          }}
          onPointerMove={(e) => {
            const p = pan.current;
            if (!p) return;
            place(p.left + (e.clientX - p.x), p.top + (e.clientY - p.y));
          }}
          onPointerUp={() => {
            pan.current = null;
            setGrabbing(false);
          }}
          onPointerCancel={() => {
            pan.current = null;
            setGrabbing(false);
          }}
        >
          <div className="stage-inner" ref={inner}>
            <div className={side ? 'side-by-side' : ''}>
              {side && compare.image ? (
                <div>
                  <div className="label-above">Captured</div>
                  <img className="shot" src={compare.image} alt="Captured screenshot" style={{ width: (compare.box?.w ?? width) * scale * 0.5 }} />
                </div>
              ) : null}
              <div>
                {side ? <div className="label-above">Edited</div> : null}
                <Canvas
                  doc={doc}
                  mode={mode}
                  width={width}
                  zoom={canvasScale}
                  selected={selected}
                  onSelect={setSelected}
                  onMove={onMove}
                  onEditText={(nodeId) => {
                    setSelected(nodeId);
                    setRight('design');
                    setFocusText((n) => n + 1);
                  }}
                  onKey={onKey}
                  onInspect={setInspected}
                  onResize={onResize}
                  onInsertAt={onInsertAt}
                  onWheel={onWheel}
                  compare={compare}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="side right">
          <div className="tabs">
            <Button className={right === 'design' ? 'on' : ''} onClick={() => setRight('design')}>Design</Button>
            <Button className={right === 'inspect' ? 'on' : ''} onClick={() => setRight('inspect')}>Inspect</Button>
            <Button className={right === 'deviations' ? 'on' : ''} onClick={() => setRight('deviations')}>
              Deviations{deviating.size ? ` · ${liveDeviations(doc).filter((d) => !d.resolution).length}` : ''}
            </Button>
            <Button className={right === 'handover' ? 'on' : ''} onClick={() => setRight('handover')}>Hand over</Button>
          </div>
          <div className="pane">
            {right === 'design' ? <DesignPanel doc={doc} selected={selected} update={update} select={setSelected} focusText={focusText} inspected={inspected} /> : null}
            {right === 'inspect' ? <Inspect el={inspected} doc={doc} mode={mode} select={setSelected} toast={(message, error) => setToast({ message, error })} /> : null}
            {right === 'deviations' ? (
              <Deviations
                doc={doc}
                update={update}
                select={(nodeId) => {
                  setSelected(nodeId);
                  setRight('design');
                }}
              />
            ) : null}
            {right === 'handover' ? (
              <ExportPanel
                screen={screen}
                doc={doc}
                update={update}
                rename={(name) => {
                  const next = { ...screen, name, doc: historyRef.current!.doc };
                  setScreen(next);
                  void put('screens', next);
                }}
                restore={(restored) => update((d) => Object.assign(d, restored))}
                capture={capture}
                toast={(message, error) => setToast({ message, error })}
              />
            ) : null}
          </div>
        </div>
      </div>
      {toast ? <Toast message={toast.message} error={toast.error} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
