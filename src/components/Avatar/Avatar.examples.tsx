import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Avatar`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Avatar',
  category: 'Data Display',
  tagline:
    'Represents a user or entity with initials, an icon, or a photo, plus an optional status badge.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=981-16471',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'Initials or an icon, shown when no image `src` is provided. Inherited from MUI.',
    },
    {
      name: 'src',
      type: 'string',
      default: '—',
      description:
        'Image URL. When set, the photo fills the avatar and `children` are ignored. Inherited from MUI.',
    },
    {
      name: 'alt',
      type: 'string',
      default: '—',
      description:
        'Alternative text for the image. Inherited from MUI.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Diameter: 24px, 32px, or 40px.',
    },
    {
      name: 'shape',
      type: "'round' | 'mid' | 'sharp'",
      default: "'round'",
      description:
        'Corner treatment: full circle, rounded square, or square.',
    },
    {
      name: 'color',
      type: "'accent' | 'primary' | 'secondary' | 'success' | 'error' | 'warning'",
      default: "'accent'",
      description:
        'Background colour role for text / icon content. Ignored when an image renders.',
    },
    {
      name: 'badge',
      type: 'boolean',
      default: 'false',
      description: 'Shows a status dot at the bottom-right.',
    },
    {
      name: 'badgeColor',
      type: "'success' | 'error' | 'warning' | 'neutral'",
      default: "'success'",
      description: 'Colour of the status dot.',
    },
  ],
  examples: [
    {
      title: 'Initials',
      code: '<Avatar>OP</Avatar>',
    },
    {
      title: 'Photo',
      code: '<Avatar src="/users/olivia.jpg" alt="Olivia Park" />',
    },
    {
      title: 'Icon content',
      code: ['<Avatar color="primary">', '  <UserIcon />', '</Avatar>'].join('\n'),
    },
    {
      title: 'Shapes',
      code: [
        '<Avatar shape="round">OP</Avatar>',
        '<Avatar shape="mid">OP</Avatar>',
        '<Avatar shape="sharp">OP</Avatar>',
      ].join('\n'),
    },
    {
      title: 'Sizes',
      code: [
        '<Avatar size="sm">OP</Avatar>',
        '<Avatar size="md">OP</Avatar>',
        '<Avatar size="lg">OP</Avatar>',
      ].join('\n'),
    },
    {
      title: 'Status badge',
      description:
        'Set `badge` to overlay a status dot at the bottom-right. The default success green conventionally reads as online / active.',
      code: '<Avatar src="/users/olivia.jpg" alt="Olivia Park" badge />',
    },
    {
      title: 'Badge colour',
      description:
        'There is no online / away prop — presence is conveyed by `badgeColor` alone (a convention, not an enum). Common mapping: success = online, warning = away, error = busy, neutral = offline.',
      code: [
        '<Avatar badge badgeColor="success">OP</Avatar>',
        '<Avatar badge badgeColor="warning">OP</Avatar>',
        '<Avatar badge badgeColor="error">OP</Avatar>',
        '<Avatar badge badgeColor="neutral">OP</Avatar>',
      ].join('\n'),
    },
  ],
  dos: [
    'Provide `alt` text whenever you set an image `src`',
    'Use initials (one or two letters) as the fallback when no photo exists',
    'Keep one `shape` consistent across a group of avatars',
    'Use the `badge` dot for presence or status, not for counts',
  ],
  donts: [
    "Don't put more than two characters of text inside an avatar",
    "Don't hardcode background colours — use the `color` role so both colour schemes work",
    "Don't mix sizes within a single avatar group or stack",
    "Don't rely on the badge colour alone to convey status — pair it with text elsewhere",
  ],
  relatedComponents: ['Chip'],
};
