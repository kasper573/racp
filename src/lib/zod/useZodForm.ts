import * as zod from "zod";
import { AnyZodObject, ZodFirstPartyTypeKind } from "zod";
import { ChangeEvent } from "react";
import { get, set } from "lodash";
import produce from "immer";
import { Path, PathValue, pickZodType } from "./zodPath";
import { isZodType } from "./isZodType";

export function useZodForm<Schema extends AnyZodObject>({
  schema,
  value,
  onChange,
}: ZodFormOptions<Schema>) {
  type T = zod.infer<Schema>;
  const controls: ZodFormControls<T> = {
    register<P extends Path<T>, E extends Element>(
      path: P,
      getElementValue?: (element: E) => string | number | undefined
    ) {
      const fieldValue = get(value, path) as PathValue<T, P>;
      const fieldType = pickZodType(schema, path);

      if (!getElementValue) {
        getElementValue = isZodType(fieldType, ZodFirstPartyTypeKind.ZodNumber)
          ? (el) => parseNumber(getStandardElementValue(el))
          : (el) => getStandardElementValue(el);
      }

      function setValue(updatedFieldValue: PathValue<T, P>) {
        onChange(
          produce(value, (draft) => {
            set(draft, path, updatedFieldValue);
          })
        );
      }

      return {
        value: fieldValue,
        onChange: (e) => {
          if (
            typeof e === "object" &&
            "target" in e &&
            e.target instanceof Element
          ) {
            const raw = getElementValue?.(e.target as unknown as E);
            const result = fieldType?.safeParse(raw);
            if (result?.success) {
              setValue(result.data);
            }
          } else {
            setValue(e as PathValue<T, P>);
          }
        },
      };
    },
  };
  return controls;
}

function getStandardElementValue(element: Element) {
  if (element instanceof HTMLInputElement) {
    return element.value;
  }
  if (element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  throw new Error("Could not get value from element");
}

function parseNumber(str: string) {
  const n = parseFloat(str);
  return isNaN(n) ? undefined : n;
}

export interface ZodFormOptions<Schema extends AnyZodObject> {
  schema: Schema;
  value: zod.infer<Schema>;
  onChange: (updated: zod.infer<Schema>) => void;
}

export interface ZodFormControls<T> {
  register: <P extends Path<T>, E extends Element>(
    path: P,
    getRawValueFromElement?: (element: E) => string
  ) => ZodFormControlProps<T, P, E>;
}

export interface ZodFormControlProps<T, P extends Path<T>, E> {
  value: PathValue<T, P>;
  onChange: (e: ChangeEvent<E> | PathValue<T, P>) => void;
}
