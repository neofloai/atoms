'use client';

import { Chip } from '@/src/components/Chip';

import type { ChipVariant } from '@/src/components/Chip';
import type { FilterGroup, FilterOption } from '@/src/components/Filter';

/**
 * Sample data behind the Filter previews — a query log, which is the
 * kind of table the panel is sized for: a handful of short facets and
 * one long list that has to be searched.
 *
 * Kept in one place so every preview on the page filters the same thing,
 * and so the grid preview and the panel above it cannot disagree about
 * what a status or a vendor is called.
 */

/**
 * An option's value, derived from its label rather than typed twice.
 * The grid rows carry labels; the selection carries these.
 */
export function optionKey(label: string): string {
  return label.toLowerCase();
}

function textOptions(labels: readonly string[]): readonly FilterOption[] {
  return labels.map((label) => ({ value: optionKey(label), label }));
}

export const ENTITIES = [
  'Acme Pte Ltd',
  'Globex SG',
  'Initech MY',
  'Umbrella JP',
] as const;

export const ASSIGNEES = [
  'Aisha Rahman',
  'Daniel Cho',
  'Meera Nair',
  'Tom Alvarez',
] as const;

export const VENDORS = [
  'Zalora PH',
  'Lazada SG',
  'Shopee MY',
  'Tokopedia ID',
  'Bukalapak ID',
  'Flipkart IN',
  'Amazon JP',
  'Rakuten JP',
] as const;

export const TYPES = [
  'Invoice Status',
  'Invoice Submission',
  'Payment Status',
  'Credit Note',
] as const;

export const typeOptions = textOptions(TYPES);

/** A status, and the chip that stands for it wherever it is drawn. */
export interface StatusMeta {
  readonly value: string;
  readonly label: string;
  readonly variant: ChipVariant;
}

export const STATUSES: readonly StatusMeta[] = [
  { value: 'routed', label: 'Routed to Human', variant: 'warning' },
  { value: 'answered', label: 'Auto-answered', variant: 'success' },
  { value: 'auth-failed', label: 'Auth failed', variant: 'error' },
  { value: 'in-progress', label: 'In Progress', variant: 'information' },
];

/** Look a status up by the value the selection carries. */
export function statusMeta(value: string): StatusMeta {
  return STATUSES.find((status) => status.value === value) ?? STATUSES[0];
}

/**
 * The rows whose label is a node rather than a string. Each carries its
 * own `searchText`, without which the search box has nothing to read.
 */
export const statusOptions: readonly FilterOption[] = STATUSES.map(
  (status) => ({
    value: status.value,
    label: <Chip size="sm" variant={status.variant} label={status.label} />,
    searchText: status.label,
  })
);

/** The four list categories every preview shares. */
export const groups: readonly FilterGroup[] = [
  { id: 'status', label: 'Status', options: statusOptions },
  { id: 'entity', label: 'Entity', options: textOptions(ENTITIES) },
  { id: 'assignee', label: 'Assignee', options: textOptions(ASSIGNEES) },
  { id: 'vendor', label: 'Vendor Name', options: textOptions(VENDORS) },
];
