export const compareStrings: CompareFn<string> = (a, b) => a.localeCompare(b);

export const compareNumeric: CompareFn<string> = (a, b) => {
  const aNum = isNumeric(a) ? parseInt(a) : undefined;
  const bNum = isNumeric(b) ? parseInt(b) : undefined;
  if (aNum === bNum) {
    return 0;
  }
  if (aNum === undefined) {
    return 1;
  }
  if (bNum === undefined) {
    return -1;
  }
  return aNum - bNum;
};

const isNumeric = (value: string) => {
  return /^[\d.,]+$/.test(value);
};

export function invertCompareFn<T>(compareFn: CompareFn<T>): CompareFn<T> {
  return (a: T, b: T) => compareFn(b, a);
}

export type CompareFn<T = any> = (a: T, b: T) => number;

export const ignoreCase = (name: string) => new RegExp(`^${name}$`, "i");
