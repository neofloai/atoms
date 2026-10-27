import { FileTextIcon, HouseIcon } from '@neofloai/atoms/icons';
import type { ComponentType } from 'react';

import { paths } from '@/shared/config/paths';
import type { AppPath } from '@/shared/config/paths';

export interface NavItem {
  label: string;
  path: AppPath;
  Icon: ComponentType<{ size?: number }>;
}

/** The rail's rows, in order. Add a page: add its path, its route, and a row here. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', path: paths.home, Icon: HouseIcon },
  { label: 'Invoices', path: paths.invoices, Icon: FileTextIcon },
];
