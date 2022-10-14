import { ZodType } from "zod";
import { get, set } from "lodash";
import produce from "immer";
import { getZodType, Path, PathValue } from "./zodPath";
import { isZodError } from "./isZodError";

export function useZodForm<Entity>({
  schema,
  error,
  value,
  onChange: setValue,
}: UseZodFormOptions<Entity>) {
  function createFieldProps<P extends Path<Entity>>(
    path: P
  ): ZodFormRegistration<PathValue<Entity, P>> {
    const issues = isZodError(error)
      ? error?.issues
          .filter((issue) => issue.path.join(".") === path)
          .map((issue) => issue.message)
      : undefined;
    return {
      issues,
      schema: getZodType(schema, path),
      value: get(value, path),
      onChange(updatedFieldValue) {
        setValue(
          produce(value, (draft: Entity) => {
            set(draft as unknown as object, path, updatedFieldValue);
          })
        );
      },
    };
  }

  return createFieldProps;
}

export interface UseZodFormOptions<Entity> extends ZodFormOptions<Entity> {
  schema: ZodType<Entity>;
}

export interface ZodFormOptions<Entity> {
  error?: ZodFormError;
  value: Entity;
  onChange: (value: Entity) => void;
}

export interface ZodFormRegistration<Value> {
  value: Value;
  schema: ZodType<Value>;
  onChange: (updated: Value) => void;
  issues?: string[];
}

export type ZodFormError = any;
