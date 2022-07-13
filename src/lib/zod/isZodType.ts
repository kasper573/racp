import {
  ZodOptional,
  ZodType,
  ZodFirstPartyTypeKind,
  ZodUnion,
  ZodTypeAny,
  ZodIntersection,
  ZodNullable,
} from "zod";

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
  if (type instanceof ZodUnion) {
    return type._def.options.some((member: ZodTypeAny) =>
      isZodType(member, check)
    );
  }
  if (type instanceof ZodIntersection) {
    return (
      isZodType(type._def.left, check) || isZodType(type._def.right, check)
    );
  }
  if (typeof check === "object") {
    check = getTypeName(check);
  }
  return getTypeName(type) === check;
}

function getTypeName(type: ZodType) {
  let def = type._def;
  if (type instanceof ZodOptional || type instanceof ZodNullable) {
    def = type._def.innerType._def;
  }
  if ("typeName" in def) {
    return (def as Record<string, unknown>).typeName as ZodFirstPartyTypeKind;
  }
  throw new Error(`Could not get type name from ${type}`);
}
