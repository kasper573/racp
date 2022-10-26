import { ZodTypeAny } from "zod";
import * as zod from "zod";
import { ParamCodec } from "../Router";
import { normalizeZodType } from "./normalizeZodType";

/**
 * Since we support arbitrary zod types for params we serialize and deserialize
 * complex values by default, on top of regular uri encoding and type coercion.
 */
export function createDefaultParamCodec(
  serializeComplex = JSON.stringify,
  parseComplex = JSON.parse
): ParamCodec {
  return {
    encode: (value, _type) => {
      const type = normalizeZodType(_type);
      const str = isPrimitive(type) ? `${value}` : serializeComplex(value);
      return encodeURIComponent(str);
    },
    decode: (value, _type) => {
      value = decodeURIComponent(value);
      const type = normalizeZodType(_type);
      return isPrimitive(type)
        ? coercePrimitive(value, type)
        : type.parse(parseComplex(value));
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
    return Number(value);
  } else if (type instanceof zod.ZodBoolean) {
    return value === "true";
  }
  return value;
}

type NonPrimitive = object | Array<any> | Date | RegExp | undefined | null;
