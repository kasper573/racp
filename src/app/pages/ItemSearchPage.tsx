import { useState } from "react";
import { Header } from "../layout/Header";
import { useSearchItemsQuery } from "../client";
import { router } from "../router";
import { Item, ItemFilter } from "../../api/services/item/item.types";
import { DataGrid } from "../components/DataGrid";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";

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
  Slots: "Slots",
};
