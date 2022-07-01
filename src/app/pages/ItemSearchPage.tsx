import { useState } from "react";
import { Box, styled, TextField } from "@mui/material";
import { Header } from "../layout/Header";
import { useGetItemMetaQuery, useSearchItemsQuery } from "../client";
import { router } from "../router";
import {
  Item,
  ItemFilter,
  itemFilterType,
} from "../../api/services/item/item.types";
import { DataGrid } from "../components/DataGrid";
import { useZodForm } from "../../lib/zod/useZodForm";
import { typedKeys } from "../../lib/typedKeys";
import { Select } from "../components/Select";
import { SliderMenu } from "../components/SliderMenu";

export default function ItemSearchPage() {
  const [filter, setFilter] = useState<ItemFilter>({});
  return (
    <>
      <Header>Item Search</Header>
      <ItemSearchFilterForm value={filter} onChange={setFilter} />
      <DataGrid<Item, ItemFilter, Item["Id"]>
        filter={filter}
        columns={columns}
        query={useSearchItemsQuery}
        id={(item) => item.Id}
        link={(id) => router.item().view({ id })}
        sx={{ mt: 1 }}
      />
    </>
  );
}

function ItemSearchFilterForm({
  value,
  onChange,
}: {
  value: ItemFilter;
  onChange: (changed: ItemFilter) => void;
}) {
  const { register } = useZodForm({ schema: itemFilterType, value, onChange });
  const { data: meta } = useGetItemMetaQuery();

  const itemTypes = typedKeys(meta?.types ?? []);
  const itemSubTypes = meta?.types[itemTypes[0]] ?? [];
  const itemClasses = meta?.classes ?? [];
  const itemJobs = meta?.jobs ?? [];

  return (
    <FormControls>
      <TextField size="small" label="ID" type="number" {...register("Id")} />
      <TextField size="small" label="Name" />
      <Select label="Type" multiple options={itemTypes} />
      <Select
        label="SubType"
        multiple
        options={itemSubTypes}
        empty="Selected type has no sub types"
      />
      <Select label="Class" multiple options={itemClasses} />
      <Select label="Job" multiple options={itemJobs} />
      <Select label="Element" multiple options={[]} />
      <Select label="Status" multiple options={[]} />
      <Select label="Race" multiple options={[]} />
      <TextField size="small" label="Description contains" />
      <TextField size="small" label="Script contains" />
      <SliderMenu
        label="Slots"
        size="small"
        marks
        value={[2, 3]}
        step={1}
        min={0}
        max={meta?.maxSlots ?? 0}
        valueLabelDisplay="auto"
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

const columns = {
  Name: "Name",
  Buy: "Buy",
  Sell: "Sell",
  Weight: "Weight",
  Attack: "Atk",
  MagicAttack: "MAtk",
  Defense: "Def",
  EquipLevelMin: "Min Level",
  EquipLevelMax: "Max Level",
};
