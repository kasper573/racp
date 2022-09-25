export function createTextCompareFn(caseSensitive = false): CompareFn<string> {
  return (a, b) => {
    if (!caseSensitive) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return a.localeCompare(b);
  };
}

export const compareNumbers: CompareFn<number> = (a, b) => a - b;

export function invertCompareFn<T>(compareFn: CompareFn<T>): CompareFn<T> {
  return (a: T, b: T) => compareFn(b, a);
}

export type CompareFn<T = any> = (a: T, b: T) => number;
