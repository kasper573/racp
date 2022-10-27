import { ZodDefault, ZodEffects, ZodNullable, ZodOptional, ZodType } from "zod";

export function normalizeZodType(type: ZodType) {
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
