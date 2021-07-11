export const Pattern = /^(\*|\+|\-|\/|\*\*|\%)(\d+)$/;

export const GetModifierRuleString = (
  rule: string
): [string, number] | null => {
  const result = rule.match(Pattern);
  if (!result) return null;
  const [, modifier, value] = result;
  const isValidModifier = ['+', '-', '*', '/', '**', '%'].includes(modifier);
  const asNumber = parseInt(value);
  return (!!isValidModifier && !!asNumber && [modifier, asNumber]) || null;
};

export const CalculateModifier = (value: number, rule: string) => {
  const specimen = value || 0;
  const parsed = GetModifierRuleString(rule);
  if (!parsed) return 0;

  const [modifier, amount] = parsed;
  if (modifier === '+') {
    return specimen + amount;
  } else if (modifier === '*') {
    return specimen * amount;
  } else if (modifier === '/') {
    return specimen / amount;
  } else if (modifier === '-') {
    return specimen - amount;
  } else if (modifier === '**') {
    return specimen ** amount;
  } else if (modifier === '%') {
    return specimen % amount;
  }
};
