import { Box, styled } from "@mui/material";
import { ItemFilter, itemFilterType } from "../../api/services/item/item.types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { useGetItemMetaQuery } from "../client";
import { typedKeys } from "../../lib/typedKeys";
import { Select } from "../controls/Select";
import { SliderMenu } from "../controls/SliderMenu";
import { TextField } from "../controls/TextField";

export function ItemSearchFilterForm({
  value,
  onChange,
}: {
  value: ItemFilter;
  onChange: (changed: ItemFilter) => void;
}) {
  const { register: reg } = useZodForm({
    schema: itemFilterType,
    value,
    onChange,
  });
  const { data: meta } = useGetItemMetaQuery();

  const itemTypes = typedKeys(meta?.types ?? []);
  const itemSubTypes = meta?.types[itemTypes[0]] ?? [];

  return (
    <FormControls>
      <TextField size="small" label="ID" type="number" {...reg("id")} />
      <TextField size="small" label="Name" {...reg("name")} />
      <Select label="Type" multi options={itemTypes} {...reg("types")} />
      <Select
        label="Sub Type"
        multi
        options={itemSubTypes}
        empty="Selected type has no sub types"
        {...reg("subTypes")}
      />
      <Select label="Class" multi options={meta?.classes} {...reg("classes")} />
      <Select label="Job" multi options={meta?.jobs} {...reg("jobs")} />
      <Select
        label="Element"
        multi
        options={meta?.elements}
        {...reg("elements")}
      />
      <Select
        label="Status"
        multi
        options={meta?.statuses}
        {...reg("statuses")}
      />
      <Select label="Race" multi options={meta?.races} {...reg("races")} />
      <TextField
        size="small"
        label="Description contains"
        {...reg("description")}
      />
      <TextField size="small" label="Script contains" {...reg("script")} />
      <SliderMenu
        ranged
        size="small"
        label="Slots"
        max={meta?.maxSlots}
        {...reg("slots")}
      />
    </FormControls>
  );
}

const FormControls = styled(Box)`
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
