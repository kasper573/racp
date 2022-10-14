import { TextField } from "../controls/TextField";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { matcher } from "../../api/util/matcher";
import { mapInfoFilter, MapInfoFilter } from "../../api/services/map/types";

export interface MapSearchFilterFormProps {
  value: MapInfoFilter;
  onChange: (changed: MapInfoFilter) => void;
}

export function MapSearchFilterForm({
  value,
  onChange,
}: MapSearchFilterFormProps) {
  const field = useZodMatcherForm({
    matcher,
    schema: mapInfoFilter.type,
    value,
    onChange,
  });

  return (
    <>
      <TextField label="ID" optional {...field("id", "equals")} />
      <TextField label="Name" optional {...field("displayName", "contains")} />
    </>
  );
}
