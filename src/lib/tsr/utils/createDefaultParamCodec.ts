import { ZodTypeAny } from "zod";
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
      const type = normalizeZodType(_type);
      const str = isPrimitive(type) ? `${value}` : serializeComplex(value);
      return str !== undefined ? encodeURIComponent(str) : str;
    },
    decode: (value, _type) => {
      value = decodeURIComponent(value);
      const type = normalizeZodType(_type);
      return type.parse(
        isPrimitive(type) ? coercePrimitive(value, type) : parseComplex(value)
      );
    },
  };
}

function isPrimitive(type: ZodTypeAny) {
  return (
    type instanceof zod.ZodString ||
    type instanceof zod.ZodNumber ||
    type instanceof zod.ZodBoolean
  );
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
