import { Box, styled } from "@mui/material";
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
    <ControlGrid>
      <TextField size="small" label="ID" optional {...field("id", "equals")} />
      <TextField
        size="small"
        label="Name"
        optional
        {...field("displayName", "contains")}
      />
    </ControlGrid>
  );
}

const ControlGrid = styled(Box)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-auto-rows: auto;
`;
