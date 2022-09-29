import * as zod from "zod";
import { ZodError, ZodType } from "zod";
import { cloneDeep, get, set } from "lodash";
import {
  useElevatedState,
  UseElevatedStateProps,
} from "../hooks/useElevatedState";
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
        const clone = cloneDeep(value);
        set(clone, path, updatedFieldValue);
        setValue(clone);
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
