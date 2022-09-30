import {
  ZodOptional,
  ZodType,
  ZodFirstPartyTypeKind,
  ZodUnion,
  ZodTypeAny,
  ZodIntersection,
  ZodNullable,
  ZodArray,
  AnyZodObject,
  ZodObject,
  ZodDefault,
  ZodEffects,
  ZodAny,
} from "zod";

export function isZodType(
  type: ZodType | undefined,
  check: ZodFirstPartyTypeKind | ZodType
): boolean {
  if (type instanceof ZodAny || check instanceof ZodAny) {
    return true;
  }
  if (!type) {
    return false;
  }
  type = normalizeType(type);
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
    check = getTypeName(normalizeType(check));
  }
  return getTypeName(type) === check;
}

export function isZodSubType(type: ZodType, check: ZodType): boolean {
  type = normalizeType(type);
  check = normalizeType(check);
  if (type instanceof ZodArray && check instanceof ZodArray) {
    return isZodType(type.element, check.element);
  }
  if (type instanceof ZodObject && check instanceof ZodObject) {
    return intersects(type, check as AnyZodObject);
  }
  return isZodType(type, check);
}

function normalizeType(type: ZodType) {
  while (
    type instanceof ZodEffects ||
    type instanceof ZodOptional ||
    type instanceof ZodNullable ||
    type instanceof ZodDefault
  ) {
    type = type instanceof ZodEffects ? type.innerType() : type._def.innerType;
  }
  return type;
}

export function getTypeName(type: ZodType) {
  if ("typeName" in type._def) {
    return (type._def as Record<string, unknown>)
      .typeName as ZodFirstPartyTypeKind;
  }
  throw new Error(`Could not get type name from ${type}`);
}

function intersects(type: AnyZodObject, check: AnyZodObject): boolean {
  for (const key in check.shape) {
    const checkProp: ZodType = check.shape[key];
    const typeProp: ZodType | undefined = type.shape[key];
    if (!typeProp) {
      return false;
    }
    if (!isZodSubType(typeProp, checkProp)) {
      return false;
    }
  }
  return true;
}
