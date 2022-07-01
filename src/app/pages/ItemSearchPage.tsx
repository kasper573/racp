import { ReactNode, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
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
    <Box sx={{ display: "flex" }}>
      <FormCategory title="Properties">
        <TextField size="small" label="ID" type="number" {...register("Id")} />
        <TextField size="small" label="Description contains" />
        <TextField size="small" label="Script contains" />
      </FormCategory>

      <FormCategory title={<>&nbsp;</>}>
        <Select label="Type" multiple options={itemTypes} />
        {itemSubTypes.length > 0 && (
          <Select label="SubType" multiple options={itemSubTypes} />
        )}
        <Select label="Class" multiple options={itemClasses} />
        <Select label="Job" multiple options={itemJobs} />
      </FormCategory>

      <FormCategory title="Effects">
        <Select label="Element" multiple options={[]} />
        <Select label="Status" multiple options={[]} />
        <Select label="Race" multiple options={[]} />
      </FormCategory>
    </Box>
  );
}

function FormCategory({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Box sx={{ "& + &": { ml: 2 } }}>
      <Typography paragraph>{title}</Typography>
      <Box
        sx={{
          display: "grid",
          gridAutoRows: "auto",
          gridRowGap: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

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
