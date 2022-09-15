import * as zod from "zod";
import { ZodError, ZodType } from "zod";
import { get, set } from "lodash";
import produce from "immer";
import { useElevatedState, UseElevatedStateProps } from "../useElevatedState";
import { Path, PathValue } from "./zodPath";

export type ZodFormError = any;

export function useZodForm<Schema extends ZodType>({
  schema,
  error,
  ...props
}: ZodFormOptions<Schema>) {
  const [value, setValue] = useElevatedState(props);
  type Entity = zod.infer<Schema>;

  function createFieldProps<P extends Path<Entity>>(
    path: P
  ): ZodFormRegistration<PathValue<Entity, P>> {
    const issues =
      error instanceof ZodError
        ? error?.issues
            .filter((issue) => issue.path.join(".") === path)
            .map((issue) => issue.message)
        : undefined;
    return {
      issues,
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

export interface ZodFormOptions<Schema extends ZodType>
  extends UseElevatedStateProps<zod.infer<Schema>> {
  schema: Schema;
  error?: ZodFormError;
}

export interface ZodFormRegistration<Value> {
  value: Value;
  onChange: (updated: Value) => void;
  issues?: string[];
}
