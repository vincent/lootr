import { CalculateModifier, GetModifierRuleString } from './CalculateModifier';

describe('GetModifierRuleString', () => {
  it('parses', () => {
    expect(GetModifierRuleString('+1')).toIncludeAllMembers(['+', 1]);
    expect(GetModifierRuleString('-1')).toIncludeAllMembers(['-', 1]);
    expect(GetModifierRuleString('/1')).toIncludeAllMembers(['/', 1]);
    expect(GetModifierRuleString('*1')).toIncludeAllMembers(['*', 1]);
    expect(GetModifierRuleString('%1')).toIncludeAllMembers(['%', 1]);
    expect(GetModifierRuleString('**1')).toIncludeAllMembers(['**', 1]);
  });
});

describe('CalculateModifier', () => {
  it('addition', () => {
    expect(CalculateModifier(1, '+1')).toBe(2);
    expect(CalculateModifier(1, '+20')).toBe(21);
  });
  it('subtract', () => {
    expect(CalculateModifier(1, '-1')).toBe(0);
    expect(CalculateModifier(1, '-20')).toBe(-19);
  });
  it('multiply', () => {
    expect(CalculateModifier(1, '*10')).toBe(10);
    expect(CalculateModifier(1, '*20')).toBe(20);
  });
  it('division', () => {
    expect(CalculateModifier(1, '/10')).toBe(0.1);
    expect(CalculateModifier(1, '/20')).toBe(0.05);
  });
  it('power', () => {
    expect(CalculateModifier(1, '**2')).toBe(1 ** 2);
    expect(CalculateModifier(2, '**2')).toBe(2 ** 2);
    expect(CalculateModifier(2, '**20')).toBe(2 ** 20);
  });
});
