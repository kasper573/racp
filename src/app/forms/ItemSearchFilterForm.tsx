import { Box, styled } from "@mui/material";
import { useEffect } from "react";
import { ItemFilter, itemFilter } from "../../api/services/item/types";
import { useGetMetaQuery } from "../state/client";
import { typedKeys } from "../../lib/std/typedKeys";
import { Select } from "../controls/Select";
import { SliderMenu } from "../controls/SliderMenu";
import { TextField } from "../controls/TextField";
import { useLatest } from "../../lib/useLatest";
import { matcher } from "../../api/util/matcher";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";

export function ItemSearchFilterForm({ value, onChange }: FormDataProps) {
  const field = useZodMatcherForm({
    matcher,
    schema: itemFilter.type,
    value,
    onChange,
  });
  const { data: meta } = useGetMetaQuery();
  const [emptySubTypeExplanation, itemSubTypes] = useSubTypeBehavior({
    value,
    onChange,
  });

  return (
    <ControlGrid>
      <TextField
        size="small"
        label="ID"
        type="number"
        optional
        {...field("Id", "=")}
      />
      <TextField
        size="small"
        label="Name"
        optional
        {...field("Name", "contains")}
      />
      <Select
        label="Primary Type"
        multi
        options={typedKeys(meta?.types)}
        {...field("Type", "oneOf")}
      />
      <Select
        label="Subtype"
        multi
        options={itemSubTypes}
        empty={emptySubTypeExplanation}
        {...field("SubType", "oneOf")}
      />
      <Select
        label="Class"
        multi
        options={meta?.classes}
        {...field("Classes", "enabled")}
      />
      <Select
        label="Job"
        multi
        options={meta?.jobs}
        {...field("Jobs", "enabled")}
      />
      <Select
        label="Element"
        multi
        options={meta?.elements}
        {...field("Elements", "includesSome")}
      />
      <Select
        label="Status"
        multi
        options={meta?.statuses}
        {...field("Statuses", "includesSome")}
      />
      <Select
        label="Race"
        multi
        options={meta?.races}
        {...field("Races", "includesSome")}
      />
      <TextField
        size="small"
        label="Description contains"
        optional
        {...field("DescriptionList", "someItemContains")}
      />
      <TextField
        size="small"
        label="Script contains"
        optional
        {...field("ScriptList", "someItemContains")}
      />
      <SliderMenu
        ranged
        size="small"
        label="Slots"
        max={meta?.maxSlots}
        {...field("Slots", "between")}
      />
    </ControlGrid>
  );
}

interface FormDataProps {
  value: ItemFilter;
  onChange: (changed: ItemFilter) => void;
}

function useSubTypeBehavior({ value, onChange }: FormDataProps) {
  const { data: meta } = useGetMetaQuery();

  // Empty subtype filter whenever it's
  const latest = useLatest({ onChange, value });
  useEffect(() => {
    const { onChange, value } = latest.current;
    if (count(value.Type?.value) <= 1) {
      onChange({ ...value, SubType: undefined });
    }
  }, [value.Type, latest]);

  if (!meta) {
    return ["Waiting for data"] as const;
  } else if (!count(value.Type?.value)) {
    return ["Select a primary type to enable subtypes"] as const;
  } else if (count(value.Type?.value) > 1) {
    return ["Please select only one primary type to enable subtypes"] as const;
  }

  const selectedType = value.Type?.value?.[0];
  const itemSubTypes: string[] = selectedType ? meta?.types[selectedType] : [];
  if (!itemSubTypes?.length) {
    return [`${selectedType} has no subtypes`] as const;
  }

  return [undefined, itemSubTypes] as const;
}

const count = (value: unknown) => (Array.isArray(value) ? value.length : 0);

const ControlGrid = styled(Box)`
  display: grid;
  grid-gap: 8px;
  ${({ theme }) => theme.breakpoints.down("md")} {
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-rows: auto;
  }
  ${({ theme }) => theme.breakpoints.up("md")} {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-auto-rows: auto;
  }
`;
