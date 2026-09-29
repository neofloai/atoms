/**
 * Files in and out of Studio: downloads, the clipboard, and reading the
 * zips the inspector and Studio write (stored entries, or deflated ones
 * from any other zip tool).
 */
import { upgrade } from './model';

import type { Handover } from '../shared/schema';

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const fileName = (name: string) =>
  name.trim().replace(/[^\w\- .]+/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '') || 'atoms-handover';

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Every file in a zip, by name. */
export async function unzip(blob: Blob): Promise<Map<string, Blob>> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error('Not a zip file.');
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const out = new Map<string, Blob>();
  const decoder = new TextDecoder();
  for (let n = 0; n < count; n += 1) {
    if (view.getUint32(at, true) !== 0x02014b50) break;
    const method = view.getUint16(at + 10, true);
    const size = view.getUint32(at + 20, true);
    const nameLength = view.getUint16(at + 28, true);
    const extra = view.getUint16(at + 30, true);
    const comment = view.getUint16(at + 32, true);
    const local = view.getUint32(at + 42, true);
    const name = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength));
    const localName = view.getUint16(local + 26, true);
    const localExtra = view.getUint16(local + 28, true);
    const start = local + 30 + localName + localExtra;
    const raw = bytes.subarray(start, start + size);
    if (!name.endsWith('/')) {
      const data = method === 0 ? raw : method === 8 ? await inflate(raw) : null;
      if (data) out.set(name.split('/').pop()!, new Blob([data as BlobPart], { type: name.endsWith('.png') ? 'image/png' : name.endsWith('.json') ? 'application/json' : '' }));
    }
    at += 46 + nameLength + extra + comment;
  }
  return out;
}

export interface Imported {
  doc: Handover;
  image: Blob | null;
}

/** Handovers in a dropped or picked file: an `.atoms.json`, or a zip holding one or more with their screenshots. */
export async function readHandovers(file: File): Promise<Imported[]> {
  const parse = async (blob: Blob) => {
    const doc = JSON.parse(await blob.text()) as Handover;
    if (doc.format !== 'atoms-screen') throw new Error(`${file.name} is not an Atoms handover.`);
    return upgrade(doc);
  };
  if (/\.zip$/i.test(file.name)) {
    const files = await unzip(file);
    const out: Imported[] = [];
    for (const [name, blob] of files) {
      if (!name.endsWith('.json')) continue;
      const doc = await parse(blob);
      const image = (doc.image && files.get(doc.image)) || files.get(name.replace(/\.atoms\.json$|\.json$/, '.png')) || null;
      out.push({ doc, image });
    }
    if (!out.length) throw new Error(`${file.name} holds no .atoms.json.`);
    return out;
  }
  return [{ doc: await parse(file), image: null }];
}
