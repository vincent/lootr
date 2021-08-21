import { IsFunction } from './IsFunction';

describe('IsFunction', () => {
  it('confirms', () => {
    expect(IsFunction(() => {})).toBeTruthy();
    expect(IsFunction('() => {}')).toBeFalsy();
    expect(IsFunction(1)).toBeFalsy();
    expect(IsFunction(false)).toBeFalsy();
    expect(IsFunction(undefined)).toBeFalsy();
  });
});
