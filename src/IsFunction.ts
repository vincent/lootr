export function IsFunction(func: any): func is CallableFunction {
  return (
    typeof func === 'function' &&
    !/^class\s/.test(Function.prototype.toString.call(func))
  );
}
