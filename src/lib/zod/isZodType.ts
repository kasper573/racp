import {
  ZodOptional,
  ZodType,
  ZodFirstPartyTypeKind,
  ZodUnion,
  ZodTypeAny,
  ZodIntersection,
} from "zod";
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
