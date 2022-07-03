import * as zod from "zod";
import { AnyZodObject, ZodFirstPartyTypeKind } from "zod";
import { ChangeEvent } from "react";
import { get, set } from "lodash";
import produce from "immer";
import {
  useElevatedState,
  UseElevatedStateProps,
} from "../../app/hooks/useElevatedState";
import { Path, PathValue, getZodType } from "./zodPath";
import { isZodType } from "./isZodType";

export function useZodForm<Schema extends AnyZodObject>({
  schema,
  ...props
}: ZodFormOptions<Schema>) {
  const [value, setValue] = useElevatedState(props);

  type Entity = zod.infer<Schema>;
  const controls: ZodFormControls<Entity> = {
    register<P extends Path<Entity>, E extends Element>(path: P) {
      const fieldValue = get(value, path) as PathValue<Entity, P>;
      const fieldType = getZodType(schema, path);
      const isNumber = isZodType(fieldType, ZodFirstPartyTypeKind.ZodNumber);
      const getElementValue = isNumber
        ? (el: Element) => parseNumber(getStandardElementValue(el))
        : (el: Element) => getStandardElementValue(el);

      function setFieldValue(updatedFieldValue: PathValue<Entity, P>) {
        setValue(
          produce(value, (draft) => {
            set(draft, path, updatedFieldValue);
          })
        );
      }

      return {
        value: fieldValue,
        onChange: (e) => {
          const isDOMEvent =
            typeof e === "object" &&
            "target" in e &&
            e.target instanceof Element;

          if (isDOMEvent) {
            const raw = getElementValue?.(e.target as unknown as E);
            const result = fieldType?.safeParse(raw);
            if (result?.success) {
              setFieldValue(result.data);
            }
          } else {
            setFieldValue(e as PathValue<Entity, P>);
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

export interface ZodFormOptions<Schema extends AnyZodObject>
  extends UseElevatedStateProps<zod.infer<Schema>> {
  schema: Schema;
}

export interface ZodFormControls<Entity> {
  register: <P extends Path<Entity>>(path: P) => ZodFormControlProps<Entity, P>;
}

export interface ZodFormControlProps<T, P extends Path<T>> {
  value: PathValue<T, P>;
  onChange: (e: ChangeEvent | PathValue<T, P>) => void;
}
