/**
 * Curated subset of Phosphor icons for the docs catalog page.
 *
 * Listing all 1,512 Phosphor icons would tank the docs route's bundle
 * and overwhelm browsers, so we ship a representative spread covering
 * common UI needs (actions, navigation, status, content, social,
 * commerce, etc.). The full catalog is linked from the page header.
 *
 * Add to this list freely — keep names PascalCase and unsuffixed, i.e.
 * exactly as phosphoricons.com spells them. `IconBrowser` appends the
 * `Icon` suffix that Phosphor 2.1 added to every export, so `Folder`
 * here resolves, labels, and copies as `FolderIcon`.
 */
export const CATALOG_ICONS = [
  // Navigation
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'CaretLeft',
  'CaretRight',
  'CaretUp',
  'CaretDown',
  'House',
  'List',

  // Actions
  'Plus',
  'Minus',
  'Check',
  'X',
  'PencilSimple',
  'TrashSimple',
  'Copy',
  'DownloadSimple',
  'UploadSimple',
  'ShareNetwork',

  // Status
  'CheckCircle',
  'Warning',
  'WarningCircle',
  'Info',
  'Question',
  'XCircle',
  'ShieldCheck',
  'ShieldWarning',
  'Bell',
  'Sparkle',

  // Content
  'MagnifyingGlass',
  'Funnel',
  'Eye',
  'EyeSlash',
  'Heart',
  'Star',
  'Bookmark',
  'Tag',
  'FileText',
  'Folder',

  // People & comms
  'User',
  'UserCircle',
  'UsersThree',
  'ChatCircle',
  'Envelope',
  'Phone',

  // Commerce
  'ShoppingCart',
  'CreditCard',
  'CurrencyDollar',

  // Tools
  'GearSix',
  'SlidersHorizontal',
  'Calendar',
  'Clock',
  'Globe',
  'Link',
  'Lock',
  'Key',
] as const;

export type CatalogIconName = (typeof CATALOG_ICONS)[number];
