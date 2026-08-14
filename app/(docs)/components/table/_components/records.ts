import type { ChipVariant } from '@/src/components/Chip';

/**
 * The rows the previews are built from — the same shape of record the
 * Figma table is filled with (node 3223:61897): a reference and when it
 * arrived, a vendor, a status, an attachment, and an amount.
 *
 * Held here rather than inside a preview so that four previews can show
 * four things about the same table instead of four different tables.
 */
export interface InvoiceRecord {
  readonly id: string;
  readonly reference: string;
  readonly receivedAt: string;
  readonly vendor: string;
  readonly vendorRef: string;
  readonly status: string;
  readonly statusVariant: ChipVariant;
  readonly attachment: string;
  readonly amount: number;
  readonly owner: string;
  readonly ownerRole: string;
}

export const INVOICES: readonly InvoiceRecord[] = [
  {
    id: 'inv-1008',
    reference: '#1008',
    receivedAt: '14 Feb 2026 · 21:38',
    vendor: 'Northwind Traders',
    vendorRef: 'inv-mds1203',
    status: 'Matched',
    statusVariant: 'success',
    attachment: 'inv-so90-9333.pdf',
    amount: 14509.32,
    owner: 'Kaustav Pal',
    ownerRole: 'administrator',
  },
  {
    id: 'inv-1007',
    reference: '#1007',
    receivedAt: '14 Feb 2026 · 18:02',
    vendor: 'Blue Yonder Airlines',
    vendorRef: 'inv-mds1198',
    status: 'In review',
    statusVariant: 'primary',
    attachment: 'inv-by-40221.pdf',
    amount: 2380.0,
    owner: 'Ana Duarte',
    ownerRole: 'approver',
  },
  {
    id: 'inv-1006',
    reference: '#1006',
    receivedAt: '13 Feb 2026 · 09:47',
    vendor: 'Contoso Logistics',
    vendorRef: 'inv-mds1191',
    status: 'Held',
    statusVariant: 'warning',
    attachment: 'inv-ctl-7781.pdf',
    amount: 96140.5,
    owner: 'Ravi Menon',
    ownerRole: 'analyst',
  },
  {
    id: 'inv-1005',
    reference: '#1005',
    receivedAt: '12 Feb 2026 · 16:15',
    vendor: 'Fabrikam Supply',
    vendorRef: 'inv-mds1186',
    status: 'Rejected',
    statusVariant: 'error',
    attachment: 'inv-fab-3310.pdf',
    amount: 745.25,
    owner: 'Lena Fischer',
    ownerRole: 'approver',
  },
  {
    id: 'inv-1004',
    reference: '#1004',
    receivedAt: '11 Feb 2026 · 11:09',
    vendor: 'Tailspin Freight',
    vendorRef: 'inv-mds1180',
    status: 'Matched',
    statusVariant: 'success',
    attachment: 'inv-tsf-9052.pdf',
    amount: 18200.0,
    owner: 'Sam Okonkwo',
    ownerRole: 'analyst',
  },
  {
    id: 'inv-1003',
    reference: '#1003',
    receivedAt: '10 Feb 2026 · 08:30',
    vendor: 'Adventure Works',
    vendorRef: 'inv-mds1174',
    status: 'Matched',
    statusVariant: 'success',
    attachment: 'inv-aw-1188.pdf',
    amount: 3096.75,
    owner: 'Mira Chandra',
    ownerRole: 'analyst',
  },
];

/** One place for the money format, so every column agrees. */
export function money(amount: number): string {
  return `$ ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** The initials an avatar falls back to. */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
