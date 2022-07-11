import { ZodOptional, ZodType, ZodFirstPartyTypeKind } from "zod";
import { ZodTypeDef } from "zod/lib/types";

export function isZodType(
  type: ZodType | undefined,
  check: ZodFirstPartyTypeKind | ZodType
): boolean {
  if (!type) {
    return false;
  }
  if (type instanceof ZodOptional) {
    return isZodType(type._def.innerType, check);
  }
  if (typeof check !== "string") {
    check = getTypeName(check._def);
  }
  return getTypeName(type._def) === check;
}

function getTypeName(def: ZodTypeDef) {
  if ("typeName" in def) {
    return (def as Record<string, unknown>).typeName as ZodFirstPartyTypeKind;
  }
  throw new Error(`Could not get type name from ZodTypeDef ${def}`);
}
