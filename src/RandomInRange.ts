import { IsString } from './IsString';

export const IsRangeString = (value: any): value is string => {
  const isString = typeof value === 'string';
  const describesRange = value.match(/^(\d+)\-(\d+)$/);
  return isString && !!describesRange;
};

const SplitStringRange = (range: string) => {
  let bounds = range.split('-');
  const output: number[] = [];

  switch (bounds.length) {
    case 0:
      output[0] = 0;
      output[1] = 5;
      break;
    case 1:
      output[0] = parseInt(bounds[0], 0);
      output[1] = parseInt(bounds[0], 0) + 5;
      break;
    default:
      output[0] = parseInt(bounds[0]);
      output[1] = parseInt(bounds[bounds.length - 1]);
  }

  return output;
};
/**
 * Return a random number in the specified range.
 * This method is meant to be use internaly.
 *
 * @param  {string} range x-y
 *
 * @return {number} Random number in range
 */
export const RandomInRange = (range: string | number): number => {
  const bounds = IsString(range) ? SplitStringRange(range) : [0, range];
  return Math.floor(Math.random() * (bounds[1] - bounds[0] + 1)) + bounds[0];
};
