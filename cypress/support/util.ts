export const compareStrings: CompareFn<string> = (a, b) => a.localeCompare(b);

export const compareNumeric: CompareFn<string> = (a, b) => {
  const aNum = isNumeric(a) ? parseInt(a) : Number.MIN_SAFE_INTEGER;
  const bNum = isNumeric(b) ? parseInt(b) : Number.MIN_SAFE_INTEGER;
  return aNum - bNum;
};

export const compareThousands: CompareFn<string> = (a, b) => {
  const remove = /[\d.,]/gm;
  return compareNumeric(a.replaceAll(remove, ""), b.replaceAll(remove, ""));
};

const isNumeric = (value: string) => {
  return /^[\d.,]+$/.test(value);
};

export function invertCompareFn<T>(compareFn: CompareFn<T>): CompareFn<T> {
  return (a: T, b: T) => compareFn(b, a);
}

export type CompareFn<T = any> = (a: T, b: T) => number;

export const ignoreCase = (name: string, { exact = true } = {}) =>
  new RegExp(exact ? `^${name}$` : name, "i");
