/**
 * Display formatting, in one place so a table and a summary card never
 * disagree about how money or a date looks.
 */
const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  const key = `${locale}:${currency}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** An ISO date (`2026-10-27`) as `Oct 27, 2026`. Read as UTC so it never shifts a day. */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
