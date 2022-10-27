import { ZodEnum, ZodNativeEnum, ZodTypeAny, ZodUnion } from "zod";
import * as zod from "zod";
import { ParamCodec } from "../types";
import { normalizeZodType } from "./normalizeZodType";

/**
 * # Notes on codecs in general:
 * TSR only extracts and plots parameters by name by default,
 * even though runtime type information is always available for all parameters.
 *
 * The remaining formatting and parsing is left to the codec,
 * to allow users to choose/write their own codec.
 *
 * # The default codec:
 * Since we support arbitrary types for params, this codec serializes
 * complex value types  on top of regular uri encoding.
 * It also performs type coercion for primitives.
 * This is necessary to support numbers and booleans in the url.
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
    type instanceof zod.ZodBoolean
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
