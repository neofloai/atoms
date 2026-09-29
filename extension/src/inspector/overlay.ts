/**
 * The canvas layer: outlines, box-model bands, gap hatching, and the red
 * distance lines. Redrawn whole on every frame that needs it — a few
 * dozen positioned divs, cheap enough to not be worth diffing.
 */
import { boxModel, distances, gapBands, inset, outset, toRect, type Rect } from './measure';
import { spaceLabel } from './tokens';

export interface OverlayState {
  hover: Element | null;
  hoverName: string;
  selected: Element | null;
  selectedName: string;
  measuring: boolean;
  /** Studio draws over a zoomed canvas: positions scale, labels stay at their size. */
  scale?: number;
  /** Space above the drawing area where a label can sit (Studio's stage margin). */
  roomAbove?: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export class Overlay {
  private readonly layer: HTMLDivElement;
  private k = 1;
  private room = 0;

  constructor(root: ShadowRoot | HTMLElement) {
    this.layer = document.createElement('div');
    this.layer.className = 'layer';
    root.appendChild(this.layer);
  }

  draw(state: OverlayState) {
    this.layer.replaceChildren();
    this.k = state.scale ?? 1;
    this.room = state.roomAbove ?? 0;
    const { hover, selected } = state;

    const measuringTo = state.measuring && !!hover && hover !== selected;
    if (selected?.isConnected) this.drawSelection(selected, state.selectedName, !measuringTo);

    if (hover?.isConnected && hover !== selected) {
      const rect = toRect(hover.getBoundingClientRect());
      this.box(rect, 'outline-hover');
      if (!(state.measuring && selected)) this.tag(rect.left, rect.top, state.hoverName, 'tag-hover', 'above');
    }

    if (state.measuring && selected?.isConnected && hover?.isConnected && hover !== selected) {
      const a = toRect(selected.getBoundingClientRect());
      const b = toRect(hover.getBoundingClientRect());
      for (const d of distances(a, b)) {
        for (const [x1, y1, x2, y2] of d.guides) this.guide(x1, y1, x2, y2);
        this.line(d.x1, d.y1, d.x2, d.y2);
        this.tag((d.x1 + d.x2) / 2, (d.y1 + d.y2) / 2, spaceLabel(d.value), 'tag-measure', 'center');
      }
    }
  }

  private drawSelection(el: Element, name: string, withSize: boolean) {
    const bm = boxModel(el);
    const marginBox = outset(bm.border, bm.margin);
    const paddingBox = inset(bm.border, bm.borderWidth);
    const contentBox = inset(paddingBox, bm.padding);

    this.bands(marginBox, bm.border, 'band-margin');
    this.bands(paddingBox, contentBox, 'band-padding', bm.padding);

    for (const gap of gapBands(el)) {
      this.box(gap.rect, 'band-gap');
      const w = gap.rect.right - gap.rect.left;
      const h = gap.rect.bottom - gap.rect.top;
      if (w >= 1 && h >= 1) {
        this.tag(
          gap.rect.left + w / 2,
          gap.rect.top + h / 2,
          gap.auto ? 'Auto' : spaceLabel(gap.value),
          'tag-gap',
          'center',
        );
      }
    }

    this.box(bm.border, 'outline-select');
    this.tag(bm.border.left, bm.border.top, name, 'tag-select', 'above');
    if (!withSize) return;
    this.tag(
      (bm.border.left + bm.border.right) / 2,
      bm.border.bottom + 4,
      `${r2(bm.width)} × ${r2(bm.height)}`,
      'tag-select',
      'below',
    );
  }

  /** The four strips between an outer and an inner rect, labelled when wide enough. */
  private bands(outer: Rect, inner: Rect, cls: string, values?: { top: number; right: number; bottom: number; left: number }) {
    const strips: [Rect, number | undefined][] = [
      [{ left: outer.left, right: outer.right, top: outer.top, bottom: inner.top }, values?.top],
      [{ left: outer.left, right: outer.right, top: inner.bottom, bottom: outer.bottom }, values?.bottom],
      [{ left: outer.left, right: inner.left, top: inner.top, bottom: inner.bottom }, values?.left],
      [{ left: inner.right, right: outer.right, top: inner.top, bottom: inner.bottom }, values?.right],
    ];
    for (const [rect, value] of strips) {
      const w = rect.right - rect.left;
      const h = rect.bottom - rect.top;
      if (w < 0.5 || h < 0.5) continue;
      this.box(rect, cls);
      if (value && Math.min(w, h) >= 10) {
        this.tag(rect.left + w / 2, rect.top + h / 2, String(r2(value)), 'tag-padding', 'center');
      }
    }
  }

  private box(r: Rect, cls: string) {
    const el = document.createElement('div');
    el.className = `box ${cls}`;
    const k = this.k;
    Object.assign(el.style, {
      left: `${r.left * k}px`,
      top: `${r.top * k}px`,
      width: `${Math.max(0, r.right - r.left) * k}px`,
      height: `${Math.max(0, r.bottom - r.top) * k}px`,
    });
    this.layer.appendChild(el);
  }

  private line(x1: number, y1: number, x2: number, y2: number) {
    [x1, y1, x2, y2] = [x1, y1, x2, y2].map((v) => v * this.k);
    const el = document.createElement('div');
    el.className = 'line';
    const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
    Object.assign(el.style, horizontal
      ? { left: `${Math.min(x1, x2)}px`, top: `${y1 - 0.5}px`, width: `${Math.abs(x2 - x1)}px`, height: '1px' }
      : { left: `${x1 - 0.5}px`, top: `${Math.min(y1, y2)}px`, width: '1px', height: `${Math.abs(y2 - y1)}px` });
    this.layer.appendChild(el);
  }

  private guide(x1: number, y1: number, x2: number, y2: number) {
    [x1, y1, x2, y2] = [x1, y1, x2, y2].map((v) => v * this.k);
    const el = document.createElement('div');
    el.className = 'guide';
    const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
    Object.assign(el.style, horizontal
      ? { left: `${Math.min(x1, x2)}px`, top: `${y1}px`, width: `${Math.abs(x2 - x1)}px`, borderTopWidth: '1px' }
      : { left: `${x1}px`, top: `${Math.min(y1, y2)}px`, height: `${Math.abs(y2 - y1)}px`, borderLeftWidth: '1px' });
    this.layer.appendChild(el);
  }

  private tag(x: number, y: number, label: string, cls: string, place: 'above' | 'below' | 'center') {
    if (!label) return;
    const el = document.createElement('div');
    el.className = `tag ${cls}`;
    el.textContent = label;
    const transform = {
      above: y * this.k + this.room > 20 ? 'translateY(calc(-100% - 2px))' : 'translateY(2px)',
      below: 'translateX(-50%)',
      center: 'translate(-50%, -50%)',
    }[place];
    Object.assign(el.style, { left: `${x * this.k}px`, top: `${y * this.k}px`, transform });
    this.layer.appendChild(el);
  }
}
