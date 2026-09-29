/**
 * Runs in the extension's isolated world next to the inspector, and
 * relays its screenshot requests to the background worker — the page's
 * own world, where the inspector lives, cannot reach `chrome.*`.
 *
 * It answers only while the inspector is open, and takes a screenshot
 * only right after a click, so a page cannot use it to photograph itself
 * on its own. It also hands exports to Atoms Studio, and opens it.
 */
declare global {
  interface Window {
    __atomsBridge?: () => void;
  }
}

// A reinjection (or a reloaded extension) replaces the previous listener.
window.__atomsBridge?.();

interface Request {
  source?: string;
  type?: 'capture' | 'studio' | 'studio-home';
  id?: string;
  doc?: unknown;
  image?: string | null;
  imageBox?: unknown;
  project?: string;
}

const onMessage = (event: MessageEvent) => {
  const data = event.data as Request | null;
  if (event.source !== window || data?.source !== 'atoms-inspector') return;
  if (data.type !== 'capture' && data.type !== 'studio' && data.type !== 'studio-home') return;
  const reply = (body: Record<string, unknown>) =>
    window.postMessage({ source: 'atoms-inspector-bridge', id: data.id, ...body }, '*');
  if (!document.querySelector('atoms-inspector')) return;
  if (data.type === 'studio-home') {
    if (!chrome.runtime?.id) {
      reply({ error: 'The extension was reloaded. Refresh the page and turn the inspector on again.' });
      return;
    }
    chrome.runtime
      .sendMessage({ type: 'atoms-studio-home' })
      .then((answer: Record<string, unknown> | undefined) => reply(answer ?? { error: 'No answer from the extension.' }))
      .catch((error: unknown) => reply({ error: error instanceof Error ? error.message : String(error) }));
    return;
  }
  if (data.type === 'studio') {
    // Files a handover in Atoms Studio and opens it there.
    if (!chrome.runtime?.id) {
      reply({ error: 'The extension was reloaded. Refresh the page and turn the inspector on again.' });
      return;
    }
    chrome.runtime
      .sendMessage({ type: 'atoms-studio-open', doc: data.doc, image: data.image, imageBox: data.imageBox, project: data.project })
      .then((answer: Record<string, unknown> | undefined) => reply(answer ?? { error: 'No answer from the extension.' }))
      .catch((error: unknown) => reply({ error: error instanceof Error ? error.message : String(error) }));
    return;
  }
  if (!navigator.userActivation?.isActive) {
    reply({ error: 'Click the button again — the screenshot has to follow a click.' });
    return;
  }
  if (!chrome.runtime?.id) {
    reply({ error: 'The extension was reloaded. Refresh the page and turn the inspector on again.' });
    return;
  }
  chrome.runtime
    .sendMessage({ type: 'atoms-capture' })
    .then((answer: { dataUrl?: string; error?: string } | undefined) => reply(answer ?? { error: 'No answer from the extension.' }))
    .catch((error: unknown) => reply({ error: error instanceof Error ? error.message : String(error) }));
};

window.addEventListener('message', onMessage);
window.__atomsBridge = () => window.removeEventListener('message', onMessage);

export {};
