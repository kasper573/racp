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

type EnumLike<T> = {
  [id: string]: T | string;
  [nu: number]: string;
};
