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
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=978-17187',
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
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description:
        'Diameter: 20px, 24px, 36px, or 44px. `xs` holds a single initial.',
    },
    {
      name: 'shape',
      type: "'round' | 'mid' | 'sharp'",
      default: "'round'",
      description:
        'Corner treatment: a full circle, a square with 4px corners, or a square with none.',
    },
    {
      name: 'color',
      type: "'primary' | 'purple' | 'information' | 'success' | 'warning' | 'orange' | 'error' | 'secondary'",
      default: "'primary'",
      description:
        'Colour role for initials and icon content: a pale fill, a hairline a step deeper, and a dark ink, all of one hue. `secondary` is the neutral grey. Ignored when an image renders, which keeps only a neutral hairline.',
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
      description: 'An icon takes the role ink, the same as initials.',
      code: ['<Avatar color="success">', '  <UserIcon />', '</Avatar>'].join('\n'),
    },
    {
      title: 'Colour roles',
      description:
        'Eight hues. Give the same person the same role everywhere they appear, so the colour helps them be recognised.',
      code: [
        '<Avatar color="primary">AV</Avatar>',
        '<Avatar color="purple">AV</Avatar>',
        '<Avatar color="information">AV</Avatar>',
        '<Avatar color="success">AV</Avatar>',
        '<Avatar color="warning">AV</Avatar>',
        '<Avatar color="orange">AV</Avatar>',
        '<Avatar color="error">AV</Avatar>',
        '<Avatar color="secondary">AV</Avatar>',
      ].join('\n'),
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
        '<Avatar size="xs">O</Avatar>',
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
    "Don't put more than two characters of text inside an avatar, or more than one at `xs`",
    "Don't hardcode background colours — use the `color` role so both colour schemes work",
    "Don't use `error` or `warning` to say something about the person — in an avatar they are only hues",
    "Don't mix sizes within a single avatar group or stack",
    "Don't rely on the badge colour alone to convey status — pair it with text elsewhere",
  ],
  relatedComponents: ['Chip'],
};
