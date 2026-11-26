import { Box } from '@/src/components/Box';
import { Card } from '@/src/components/Card';
import { IconButton } from '@/src/components/IconButton';
import { LinearProgress } from '@/src/components/Progress';
import { Stack } from '@/src/components/Stack';
import { Typography } from '@/src/components/Typography';
import {
  FileCsvIcon,
  FileDocIcon,
  FileIcon,
  FileImageIcon,
  FilePdfIcon,
  FileXlsIcon,
  FolderIcon,
  XIcon,
  type Icon,
} from '@/src/icons/glyphs';
import { border, icon as iconTokens, radius, surface, text } from '@/src/tokens';
import type { ReactNode } from 'react';
import type { Attachment } from '../../core/protocol/types';
import type { ComposerAttachment } from '../../core/store/types';
import { useLabels } from '../../react/hooks';
import type { FileKind } from '../../react/labels';
import { mode, type AtomsTheme } from '../kit/tokens';

const SPREADSHEET = new Set(['xls', 'xlsx', 'xlsm', 'ods', 'numbers', 'tsv']);
const DOCUMENT = new Set(['doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'pages']);
const IMAGE = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic', 'bmp', 'tif', 'tiff']);

/** What a file is, from its extension, else its content type. */
export function fileKindOf(name: string, contentType?: string): { kind: FileKind; glyph: Icon } {
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
  const type = contentType?.toLowerCase() ?? '';
  if (ext === 'csv' || type === 'text/csv') return { kind: 'spreadsheet', glyph: FileCsvIcon };
  if (SPREADSHEET.has(ext) || type.includes('spreadsheet') || type.includes('excel')) return { kind: 'spreadsheet', glyph: FileXlsIcon };
  if (ext === 'pdf' || type === 'application/pdf') return { kind: 'pdf', glyph: FilePdfIcon };
  if (IMAGE.has(ext) || type.startsWith('image/')) return { kind: 'image', glyph: FileImageIcon };
  if (DOCUMENT.has(ext) || type.includes('word') || type.startsWith('text/')) return { kind: 'document', glyph: FileDocIcon };
  return { kind: 'file', glyph: FileIcon };
}

export interface FileCardProps {
  name: string;
  /** Kept for the tooltip-free card: the size is not drawn, the kind is. */
  size?: number;
  contentType?: string;
  /** A folder rather than a file: the folder glyph and "Folder". */
  folder?: boolean;
  /** Overrides what the card says the file is ("Spreadsheet"). */
  kind?: ReactNode;
  /** Overrides the glyph in the tile. */
  icon?: ReactNode;
  status?: ComposerAttachment['status'];
  progress?: number;
  error?: string;
  onRemove?: () => void;
  href?: string;
}

/**
 * Figma FileCard: a file or folder in the composer or on a sent message — a tile with its type,
 * its name, what it is ("Spreadsheet", "PDF document", "Folder"), and × to take it out.
 */
export function FileCard({ name, contentType, folder, kind, icon, status = 'ready', progress, error, onRemove }: FileCardProps) {
  const labels = useLabels();
  const found = folder ? { kind: 'folder' as const, glyph: FolderIcon } : fileKindOf(name, contentType);
  const Glyph = found.glyph;
  const detail =
    status === 'uploading' ? labels.uploading : status === 'error' ? (error ?? labels.uploadFailed) : (kind ?? labels.fileKind(found.kind));
  return (
    <Card component="article" aria-label={name} sx={{ width: 240, maxWidth: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1.5 }}>
        <Box
          aria-hidden
          sx={(t: AtomsTheme) => ({
            width: 32,
            height: 32,
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: `${radius.xs}px`,
            border: '1px solid',
            '& svg': { width: 16, height: 16 },
            ...mode(t, { backgroundColor: surface.layers.card2, borderColor: border.layers.card3, color: iconTokens.default.b1 }),
          })}
        >
          {icon ?? <Glyph />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body0" noWrap component="div" sx={(t: AtomsTheme) => mode(t, { color: text.default.b1 })}>
            {name}
          </Typography>
          <Typography
            variant="body1"
            noWrap
            component="div"
            sx={(t: AtomsTheme) => mode(t, { color: status === 'error' ? text.error[3] : text.default.b3 })}
          >
            {detail}
          </Typography>
        </Box>
        {onRemove ? (
          <IconButton size="sm" variant="secondary" appearance="text" aria-label={labels.removeAttachment(name)} onClick={onRemove}>
            <XIcon />
          </IconButton>
        ) : null}
      </Stack>
      {status === 'uploading' ? (
        <LinearProgress variant={progress ? 'determinate' : 'indeterminate'} value={(progress ?? 0) * 100} />
      ) : null}
    </Card>
  );
}

/** A sent attachment, shown with the user's message. */
export function AttachmentCard({ attachment }: { attachment: Attachment }) {
  return <FileCard name={attachment.filename} size={attachment.size} contentType={attachment.content_type} />;
}
