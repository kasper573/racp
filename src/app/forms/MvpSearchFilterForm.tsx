import { TextField } from "../controls/TextField";
import {
  mvpFilter,
  MvpFilter,
  mvpLifeStatusOptions,
} from "../../api/services/monster/types";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { matcher } from "../../api/matcher";
import { Select } from "../controls/Select";

export interface MvpSearchFilterFormProps {
  value: MvpFilter;
  onChange: (changed: MvpFilter) => void;
}

export function MvpSearchFilterForm({
  value,
  onChange,
}: MvpSearchFilterFormProps) {
  const field = useZodMatcherForm({
    matcher,
    schema: mvpFilter.type,
    value,
    onChange,
  });

  return (
    <>
      <TextField
        debounce
        label="Monster ID"
        type="number"
        optional
        {...field("monsterId", "=")}
      />
      <TextField
        debounce
        label="Monster name"
        optional
        {...field("name", "contains")}
      />
      <TextField
        debounce
        label="Map ID"
        optional
        {...field("mapId", "equals")}
      />
      <TextField
        debounce
        label="Map name"
        optional
        {...field("mapName", "contains")}
      />
      <Select
        label="Status"
        multi
        options={mvpLifeStatusOptions}
        {...field("lifeStatus", "oneOf")}
      />
      <TextField
        debounce
        label="MVP"
        optional
        {...field("killedBy", "contains")}
      />
    </>
  );
}
