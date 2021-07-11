import { IsString } from './IsString';

describe('IsString', () => {
  it('confirms', () => {
    expect(IsString('() => {}')).toBeTruthy();
    expect(IsString(() => {})).toBeFalsy();
    expect(IsString(1)).toBeFalsy();
    expect(IsString(false)).toBeFalsy();
    expect(IsString(class {})).toBeFalsy();
    expect(IsString(undefined)).toBeFalsy();
  });
});
