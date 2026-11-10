import { formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
  it('formats in the given currency', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    // Intl separates the symbol with a no-break space, which varies by ICU version.
    expect(formatCurrency(1234.5, 'EUR', 'de-DE')).toMatch(/^1\.234,50\s€$/u);
  });
});

describe('formatDate', () => {
  it('does not shift an ISO date across time zones', () => {
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
  });
});
