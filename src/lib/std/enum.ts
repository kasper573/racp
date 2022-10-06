export function getEnumName<T>(enumObject: EnumLike<T>, enumValue: T): string {
  const name = Object.keys(enumObject).find(
    (key) => enumObject[key] === enumValue
  );
  if (!name) {
    throw new Error(
      `Enum value ${enumValue} not found in enum object ${enumObject}`
    );
  }
  return name;
}

export function matchEnumBits<T extends EnumLike>(enumObject: T, bits: number) {
  const record = Object.entries(enumObject).reduce((record, [name, flag]) => {
    if ((bits & flag) === flag) {
      record[name as keyof T] = true;
    }
    return record;
  }, {} as EnumBitMatch<T>);
  return record;
}

export type EnumBitMatch<T extends EnumLike> = Partial<
  Record<keyof T, boolean>
>;

export type EnumLike<T = any> = {
  [id: string]: T | string;
  [nu: number]: string;
};
