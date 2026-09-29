/**
 * Screenshots, files and the clipboard for the handover export.
 *
 * Only the extension can photograph a tab (`chrome.tabs.captureVisibleTab`),
 * and this script runs in the page's world, where `chrome.*` is not
 * available. It asks through `window.postMessage`; the bridge the
 * background worker injects into the extension's isolated world relays
 * the request and posts the picture back.
 */

const REQUEST = 'atoms-inspector';
const REPLY = 'atoms-inspector-bridge';

/** Sends a request through the bridge and waits for its answer. */
function ask<T extends { error?: string }>(body: Record<string, unknown>, timeout: number): Promise<T> {
  const id = Math.random().toString(36).slice(2);
  return new Promise((resolve, reject) => {
    const done = () => {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
    };
    const timer = setTimeout(() => {
      done();
      reject(new Error('The extension did not answer. Reload it on chrome://extensions, refresh the page, and turn the inspector on again.'));
    }, timeout);
    const onMessage = (event: MessageEvent) => {
      const data = event.data as (T & { source?: string; id?: string }) | null;
      if (event.source !== window || data?.source !== REPLY || data.id !== id) return;
      done();
      if (data.error) reject(new Error(data.error));
      else resolve(data);
    };
    window.addEventListener('message', onMessage);
    window.postMessage({ source: REQUEST, id, ...body }, '*');
  });
}

/** Files a handover in Atoms Studio, with its screenshot, and opens it in a new tab. */
export async function openInStudio(doc: unknown, image: Blob | null, imageBox: Shot['box'] | null, project: string): Promise<void> {
  const dataUrl = image
    ? await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      })
    : null;
  await ask({ type: 'studio', doc, image: dataUrl, imageBox, project }, 15_000);
}

/** Opens Atoms Studio — every project and design saved in this browser — in a new tab. */
export async function openStudioHome(): Promise<void> {
  await ask({ type: 'studio-home' }, 5_000);
}

/** The visible part of the tab as a PNG data URL. */
function captureViewport(): Promise<string> {
  const id = Math.random().toString(36).slice(2);
  return new Promise((resolve, reject) => {
    const done = () => {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
    };
    const timer = setTimeout(() => {
      done();
      reject(new Error('The extension did not answer. Reload it on chrome://extensions, refresh the page, and turn the inspector on again.'));
    }, 4000);
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; id?: string; dataUrl?: string; error?: string } | null;
      if (event.source !== window || data?.source !== REPLY || data.id !== id) return;
      done();
      if (data.dataUrl) resolve(data.dataUrl);
      else reject(new Error(data.error ?? 'The screenshot failed.'));
    };
    window.addEventListener('message', onMessage);
    window.postMessage({ source: REQUEST, type: 'capture', id }, '*');
  });
}

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The screenshot could not be read.'));
    img.src = src;
  });
}

export interface Shot {
  blob: Blob;
  /** Set when the area ran past the edge of the window and only the visible part was taken. */
  cropped: boolean;
  /** Where the picture sits in the exported area, in CSS pixels (the page scroll, for a whole screen). */
  box: { x: number; y: number; w: number; h: number };
}

/**
 * A PNG of `el` (or the whole window), without the inspector in it. The
 * inspector is made transparent rather than removed, so the pointer stays
 * over it and nothing on the page flips into a hover state for the shot.
 */
export async function screenshot(el: Element | null, hide: (hidden: boolean) => void): Promise<Shot> {
  if (el) {
    const r = el.getBoundingClientRect();
    const fits = r.width <= window.innerWidth && r.height <= window.innerHeight;
    const visible = r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
    // Instant, not the page's smooth scrolling: the shot must not land mid-scroll.
    if (fits && !visible) el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }
  hide(true);
  let url: string;
  try {
    await frame();
    await frame();
    // Let the compositor present the hidden, scrolled frame before the shot.
    await new Promise((resolve) => setTimeout(resolve, 120));
    url = await captureViewport();
  } finally {
    hide(false);
  }
  const img = await loadImage(url);
  // The shot is in device pixels; the page measures in CSS pixels.
  const scale = img.naturalWidth / window.innerWidth;
  let x = 0;
  let y = 0;
  let w = window.innerWidth;
  let h = window.innerHeight;
  let cropped = false;
  let box = { x: window.scrollX, y: window.scrollY, w, h };
  if (el) {
    const r = el.getBoundingClientRect();
    x = Math.max(0, r.left);
    y = Math.max(0, r.top);
    w = Math.min(window.innerWidth, r.right) - x;
    h = Math.min(window.innerHeight, r.bottom) - y;
    cropped = w < r.width - 1 || h < r.height - 1;
    if (w <= 0 || h <= 0) throw new Error('The selection is off screen. Scroll it into view and try again.');
    box = { x: x - r.left, y: y - r.top, w, h };
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext('2d')!.drawImage(img, x * scale, y * scale, w * scale, h * scale, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The screenshot could not be encoded.');
  return { blob, cropped, box };
}

/** Saves a file through the browser's download flow. */
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Pages served over plain http (not localhost) have no async clipboard.
  const area = document.createElement('textarea');
  area.value = text;
  area.style.cssText = 'position:fixed;opacity:0;';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('The browser blocked the clipboard. Use Download instead.');
}

/**
 * Puts an image on the clipboard. The clipboard item is created with a
 * promise straight away, inside the click, because Chrome only honours a
 * write that starts while the click is still fresh.
 */
export async function copyImage(blob: Promise<Blob>) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Copying images needs https or localhost. Use Download instead.');
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}
