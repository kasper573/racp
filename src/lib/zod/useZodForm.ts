import * as zod from "zod";
import { ZodType } from "zod";
import { get, set } from "lodash";
import produce from "immer";
import { useElevatedState, UseElevatedStateProps } from "../useElevatedState";
import { Path, PathValue } from "./zodPath";

export function useZodForm<Schema extends ZodType>({
  schema,
  ...props
}: ZodFormOptions<Schema>) {
  const [value, setValue] = useElevatedState(props);
  type Entity = zod.infer<Schema>;

  function createFieldProps<P extends Path<Entity>>(
    path: P
  ): ZodFormRegistration<PathValue<Entity, P>> {
    return {
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
}

export interface ZodFormRegistration<Value> {
  value: Value;
  onChange: (updated: Value) => void;
}
