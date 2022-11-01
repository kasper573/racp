import { ComponentProps } from "react";
import {
  InputAdornment,
  TextField as MuiTextField,
  Tooltip,
} from "@mui/material";
import { util } from "zod/lib/helpers/util";
import { useDebouncedCallback } from "use-debounce";
import { Error } from "@mui/icons-material";
import { htmlId } from "../util/htmlId";
import { useReinitializingState } from "../../lib/hooks/useReinitializingState";
import MakePartial = util.MakePartial;

export type TFPropsVariant<
  Type extends string,
  Value,
  Optional extends boolean
> = Omit<ComponentProps<typeof MuiTextField>, "onChange" | "type"> & {
  type: Type;
  issues?: string[] | string;
  debounce?: number | boolean;
} & (Optional extends true
    ? { optional: true; value?: Value; onChange?: (newValue?: Value) => void }
    : { optional?: false; value: Value; onChange?: (newValue: Value) => void });

export type TextFieldProps =
  | TFPropsVariant<"number", number, false>
  | TFPropsVariant<"number", number, true>
  | MakePartial<TFPropsVariant<"text", string, false>, "type">
  | MakePartial<TFPropsVariant<"text", string, true>, "type">
  | MakePartial<TFPropsVariant<"password", string, false>, "type">
  | MakePartial<TFPropsVariant<"password", string, true>, "type">
  | MakePartial<TFPropsVariant<"email", string, false>, "type">
  | MakePartial<TFPropsVariant<"email", string, true>, "type">;

const defaultDebounceTime = 300;

export function TextField({
  value,
  type,
  debounce = false,
  onChange,
  optional,
  issues: issuesOrIssue,
  label,
  id = typeof label === "string" ? htmlId(label) : undefined,
  ...props
}: TextFieldProps) {
  const readOnly = onChange === undefined;
  const [text, setText] = useReinitializingState(valueToText(value));
  const issues = Array.isArray(issuesOrIssue)
    ? issuesOrIssue
    : issuesOrIssue
    ? [issuesOrIssue]
    : [];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceTime = debounce === true ? defaultDebounceTime : debounce || 0;
  const enqueueChange = useDebouncedCallback(
    (output?: string | number) => (onChange as any)?.(output),
    debounceTime
  );

  function tryEnqueueChange(text: string) {
    if (type === "number") {
      const trimmed = text.trim();
      if (optional && trimmed === "") {
        enqueueChange(undefined);
        return;
      }
      const num = parseFloat(trimmed);
      if (isNaN(num)) {
        return;
      }
      enqueueChange(num);
      return;
    }

    optional ? enqueueChange(text ? text : undefined) : enqueueChange(text);
  }

  let ariaLabel = props["aria-label"];
  if (ariaLabel !== undefined) {
    delete props["aria-label"];
  }

  return (
    <MuiTextField
      size="small"
      type={type}
      id={id}
      label={label}
      error={(issues?.length ?? 0) > 0}
      InputProps={{
        ...props.InputProps,
        readOnly,
        componentsProps: { input: { "aria-label": ariaLabel } },
        endAdornment: !!issues.length && (
          <InputAdornment position="end">
            <Tooltip title={issues.join(", ")}>
              <Error color="error" />
            </Tooltip>
          </InputAdornment>
        ),
      }}
      value={text}
      disabled={readOnly}
      onBlur={() => enqueueChange.flush()}
      onChange={(e) => {
        setText(e.target.value);
        tryEnqueueChange(e.target.value);
      }}
      {...props}
    />
  );
}

const valueToText = (value: unknown) => `${value ?? ""}`;
