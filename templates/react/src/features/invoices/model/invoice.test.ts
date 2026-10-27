import { INVOICES_MOCK } from '../mocks/invoices.mock';
import { totalOutstanding } from './invoice';

describe('totalOutstanding', () => {
  it('sums only pending invoices', () => {
    expect(totalOutstanding(INVOICES_MOCK)).toBe(12480.5 + 45210);
  });

  it('is zero for no invoices', () => {
    expect(totalOutstanding([])).toBe(0);
  });
});
