/**
 * Clean a path, trim left and right / characters.
 * This method is meant to be use internaly.
 *
 * @param  {string} path Path to cleanup
 *
 * @return {string}      A cleaned path
 */
export const Clean = (path: string) => {
  return path.replace(/^(\/)+/g, '').replace(/(\/)+$/g, '');
};
