import type { ReactNode } from 'react';

import type { ComponentExamplesData } from '@/src/types/docs';
import type { ComponentDemo } from './Demo';

/**
 * Pairs each live preview on a component page with the exact snippet
 * from that component's `examples.tsx` which produces it, matching on
 * `title`.
 *
 * The point is that a page never retypes its own code samples: the
 * snippet a reader copies is the same string the MCP `get_component`
 * tool serves, so the two cannot drift into disagreeing about how the
 * component is used.
 *
 * A title with no matching example throws, and because the demo list is
 * built at module scope that failure surfaces during `npm run build`
 * rather than shipping a demo whose caption has come loose from its
 * code. Renaming an example is therefore a build error until the page
 * is renamed with it — which is the intent.
 */
export function demoFactory(data: ComponentExamplesData) {
  return function demo(title: string, preview: ReactNode): ComponentDemo {
    const found = data.examples.find((entry) => entry.title === title);
    if (!found) {
      throw new Error(
        `${data.name} demo "${title}" has no example of that title in ` +
          `${data.name}.examples.tsx. The docs previews and the MCP examples ` +
          'are paired by title — add or rename the example.'
      );
    }
    return {
      title,
      description: found.description,
      code: found.code,
      preview,
    };
  };
}
