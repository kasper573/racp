import { useState } from "react";
import { Header } from "../layout/Header";
import { useSearchItemsQuery } from "../state/client";
import { router } from "../router";
import { Item, ItemFilter } from "../../api/services/item/types";
import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";

export default function ItemSearchPage() {
  const [filter, setFilter] = useState<ItemFilter>({});
  return (
    <>
      <Header>Items</Header>
      <ItemSearchFilterForm value={filter} onChange={setFilter} />
      <ItemGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}

const ItemGrid = DataGrid.define<Item, ItemFilter, Item["Id"]>({
  // Without assertion typescript yields possibly infinite error
  query: useSearchItemsQuery as unknown as DataGridQueryFn<Item, ItemFilter>,
  id: (item) => item.Id,
  link: (id) => router.item().view({ id }),
  columns: {
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
  },
});
