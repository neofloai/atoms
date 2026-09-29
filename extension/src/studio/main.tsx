/**
 * Atoms Studio: the extension page where a captured design is rebuilt
 * with the real library and edited before it goes to a developer.
 * `#/` lists projects; `#/screen/<id>` opens one screen.
 */
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '../../../src/theme/fonts';
import { Editor } from './Editor';
import { Home } from './Home';
import { css } from './ui';

function useRoute() {
  const [hash, setHash] = React.useState(location.hash.slice(1) || '/');
  React.useEffect(() => {
    const on = () => setHash(location.hash.slice(1) || '/');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

function App() {
  const route = useRoute();
  const go = (path: string) => {
    location.hash = path;
  };
  const screen = /^\/screen\/(.+)$/.exec(route);
  React.useEffect(() => {
    document.title = screen ? 'Atoms Studio — editing' : 'Atoms Studio';
  }, [screen]);
  return screen ? <Editor key={screen[1]} id={screen[1]} go={go} /> : <Home go={go} />;
}

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
createRoot(document.getElementById('root')!).render(<App />);
