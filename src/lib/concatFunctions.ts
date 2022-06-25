export function concatFunctions<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Args extends any[],
  Return
>(a?: (...args: Args) => Return, b?: (...args: Args) => Return) {
  if (a && b) {
    return (...args: Args): Return => {
      const res = a(...args);
      b(...args);
      return res;
    };
  }
  return a ?? b;
}
