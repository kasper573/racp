import { ZodOptional, ZodType, ZodFirstPartyTypeKind } from "zod";

export function isZodType(
  type: ZodType | undefined,
  check: ZodFirstPartyTypeKind
): boolean {
  if (!type) {
    return false;
  }
  if (type instanceof ZodOptional) {
    return isZodType(type._def.innerType, check);
  }
  const def = type._def as Record<string, unknown>;
  if ("typeName" in def) {
    return def.typeName === check;
  }
  return false;
}
