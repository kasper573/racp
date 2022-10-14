import * as zod from "zod";
import { ZodType } from "zod";
import { get, set } from "lodash";
import produce from "immer";
import { getZodType, Path, PathValue } from "./zodPath";
import { isZodError } from "./isZodError";

export type ZodFormError = any;

export function useZodForm<Schema extends ZodType>({
  schema,
  error,
  value,
  onChange: setValue,
}: ZodFormOptions<Schema>) {
  type Entity = zod.infer<Schema>;

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
            set(draft, path, updatedFieldValue);
          })
        );
      },
    };
  }

  return createFieldProps;
}

export interface ZodFormOptions<Schema extends ZodType> {
  schema: Schema;
  error?: ZodFormError;
  value: zod.infer<Schema>;
  onChange: (value: zod.infer<Schema>) => void;
}

export interface ZodFormRegistration<Value> {
  value: Value;
  schema: ZodType<Value>;
  onChange: (updated: Value) => void;
  issues?: string[];
}
