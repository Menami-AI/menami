import { describe, it, expect } from 'vitest';
import { formatTable, formatScore, formatRestaurantRow, formatError } from '../format.js';

describe('format', () => {
  it('formatTable renders aligned columns', () => {
    const result = formatTable(
      ['Name', 'Score'],
      [['Nopa', '94'], ['Lazy Bear', '91']],
    );
    expect(result).toContain('Name');
    expect(result).toContain('Nopa');
    expect(result).toContain('Lazy Bear');
  });

  it('formatScore shows colored score', () => {
    expect(formatScore(90)).toContain('90');
    expect(formatScore(50)).toContain('50');
    expect(formatScore(20)).toContain('20');
  });

  it('formatRestaurantRow creates single-line summary', () => {
    const row = formatRestaurantRow({
      name: 'Nopa',
      cuisine: 'American',
      price_tier: 3,
      overall_score: 94,
    });
    expect(row).toContain('Nopa');
    expect(row).toContain('American');
    expect(row).toContain('$$$');
  });

  it('formatError returns human-readable message', () => {
    expect(formatError({ status: 404, body: { error: 'Not found' } }))
      .toContain('Not found');
    expect(formatError(new Error('Network fail')))
      .toContain('Network fail');
  });
});
