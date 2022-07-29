import { Box, styled } from "@mui/material";
import { useEffect } from "react";
import { ItemFilter, itemFilterType } from "../../api/services/item/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { useGetItemMetaQuery } from "../state/client";
import { typedKeys } from "../../lib/typedKeys";
import { Select } from "../controls/Select";
import { SliderMenu } from "../controls/SliderMenu";
import { TextField } from "../controls/TextField";
import { useLatest } from "../hooks/useLatest";
import { stringTransform } from "../../api/util/matcher";

export function ItemSearchFilterForm({ value, onChange }: FormDataProps) {
  const field = useZodForm({
    schema: itemFilterType,
    value,
    onChange,
  });
  const { data: meta } = useGetItemMetaQuery();
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
        {...field("id")}
      />
      <TextField
        size="small"
        label="Name"
        optional
        {...stringTransform(field("name"))}
      />
      <Select
        label="Primary Type"
        multi
        options={typedKeys(meta?.types)}
        {...field("types")}
      />
      <Select
        label="Subtype"
        multi
        options={itemSubTypes}
        empty={emptySubTypeExplanation}
        {...field("subTypes")}
      />
      <Select
        label="Class"
        multi
        options={meta?.classes}
        {...field("classes")}
      />
      <Select label="Job" multi options={meta?.jobs} {...field("jobs")} />
      <Select
        label="Element"
        multi
        options={meta?.elements}
        {...field("elements")}
      />
      <Select
        label="Status"
        multi
        options={meta?.statuses}
        {...field("statuses")}
      />
      <Select label="Race" multi options={meta?.races} {...field("races")} />
      <TextField
        size="small"
        label="Description contains"
        optional
        {...field("description")}
      />
      <TextField
        size="small"
        label="Script contains"
        optional
        {...field("script")}
      />
      <SliderMenu
        ranged
        size="small"
        label="Slots"
        max={meta?.maxSlots}
        {...field("slots")}
      />
    </ControlGrid>
  );
}

interface FormDataProps {
  value: ItemFilter;
  onChange: (changed: ItemFilter) => void;
}

function useSubTypeBehavior({ value, onChange }: FormDataProps) {
  const { data: meta } = useGetItemMetaQuery();

  // Empty subtype filter whenever it's
  const latest = useLatest({ onChange, value });
  useEffect(() => {
    const { onChange, value } = latest.current;
    if ((value.types?.length ?? 0) <= 1) {
      onChange({ ...value, subTypes: undefined });
    }
  }, [value.types, latest]);

  if (!meta) {
    return ["Waiting for data"] as const;
  } else if (!value.types?.length) {
    return ["Select a primary type to enable subtypes"] as const;
  } else if (value.types?.length > 1) {
    return ["Please select only one primary type to enable subtypes"] as const;
  }

  const selectedType = value.types[0];
  const itemSubTypes: string[] = meta?.types[selectedType];
  if (!itemSubTypes?.length) {
    return [`${selectedType} has no subtypes`] as const;
  }

  return [undefined, itemSubTypes] as const;
}

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
