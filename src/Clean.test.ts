import { Clean } from './Clean';

describe('Clean', () => {
  it('cleans', () => {
    expect(Clean('/something/')).toBe('something');
    expect(Clean('///something/')).toBe('something');
    expect(Clean('/something////')).toBe('something');
    expect(Clean('////something////')).toBe('something');
  });
});
