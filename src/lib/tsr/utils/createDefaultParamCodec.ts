import { ZodEnum, ZodNativeEnum, ZodTypeAny, ZodUnion } from "zod";
import * as zod from "zod";
import { ParamCodec } from "../types";
import { normalizeZodType } from "./normalizeZodType";

/**
 * # Notes on codecs in general:
 * Since path-to-regex only extracts and plots parameters by name by default,
 * and TSR supports arbitrary param types, extra encoding is handled by param codecs.
 *
 * The built-in runtime type info for each param is provided and expected to be used by the codec.
 * (If the codec chooses to ignore the type, no runtime validation will be performed,
 * as TSR only uses it for type inference outside the codec)
 *
 * # The default codec:
 * 1. Serializes complex value types on top of standard uri encoding.
 * 2. It also performs type coercion for primitives.
 * (This is necessary to support numbers and booleans in the url)
 */
export function createDefaultParamCodec(
  serializeComplex: (v: unknown) => string | undefined = JSON.stringify,
  parseComplex = JSON.parse
): ParamCodec {
  return {
    encode: (value, _type) => {
      value = _type.parse(value); // This enables various zod transforms, ie. default values
      const type = normalizeZodType(_type);
      const str = isPrimitiveEnoughType(type)
        ? `${value}`
        : serializeComplex(value);
      return str !== undefined ? encodeURIComponent(str) : str;
    },
    decode: (value, _type) => {
      value = decodeURIComponent(value);
      const type = normalizeZodType(_type);
      return type.parse(
        isPrimitiveEnoughType(type)
          ? coercePrimitive(value, type)
          : parseComplex(value)
      );
    },
  };
}

function isPrimitiveEnoughType(type: ZodTypeAny) {
  return (
    isPrimitiveType(type) ||
    (type instanceof ZodUnion && type._def.options.every(isPrimitiveType)) ||
    (type instanceof ZodEnum && type._def.values.every(isPrimitive)) ||
    (type instanceof ZodNativeEnum && type._def.values.every(isPrimitive))
  );
}

function isPrimitiveType(type: ZodTypeAny) {
  return (
    type instanceof zod.ZodString ||
    type instanceof zod.ZodNumber ||
    type instanceof zod.ZodBoolean ||
    (type instanceof zod.ZodLiteral && isPrimitive(type.value))
  );
}

function isPrimitive(value: unknown) {
  const type = typeof value;
  return value == null || (type !== "object" && type !== "function");
}

function coercePrimitive(value: string, type: ZodTypeAny) {
  if (type instanceof zod.ZodNumber) {
    if (!/^[\d.]+$/.test(value)) {
      throw new Error("String is not numeric");
    }
    return parseFloat(value);
  } else if (type instanceof zod.ZodBoolean) {
    return value === "true";
  }
  return value;
}

type NonPrimitive = object | Array<any> | Date | RegExp | undefined | null;
