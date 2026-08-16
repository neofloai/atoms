'use client';

import * as React from 'react';

import { IconButton } from '@/src/components/IconButton';
import { Tooltip } from '@/src/components/Tooltip';
import { CopyIcon } from '@/src/icons';

/**
 * Copy-to-clipboard affordance for CodeBlock. Client leaf so CodeBlock
 * itself can stay a server component.
 */
export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard API can fail in insecure contexts; silently ignore.
    }
  }

  return (
    <Tooltip
      title="Copied"
      placement="top"
      open={copied}
      disableHoverListener
      disableFocusListener
      disableTouchListener
    >
      <IconButton
        variant="secondary"
        size="sm"
        aria-label="Copy code"
        onClick={handleCopy}
      >
        <CopyIcon />
      </IconButton>
    </Tooltip>
  );
}

CopyButton.displayName = 'CopyButton';
