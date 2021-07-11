import { RandomInRange } from './RandomInRange';

describe('RandomInRange', () => {
  it('confirms', () => {
    expect(RandomInRange(1)).toBeGreaterThanOrEqual(0);
    expect(RandomInRange(1)).toBeLessThanOrEqual(1);
    expect(RandomInRange(100)).toBeLessThanOrEqual(100);
    expect(RandomInRange('1-1')).toBe(1);
    expect(RandomInRange('1-1000')).toBeLessThanOrEqual(1000);
  });
});
