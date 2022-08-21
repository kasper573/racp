import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import { Item, ItemFilter } from "../../api/services/item/types";
import { useSearchItemsQuery } from "../state/client";
import { router } from "../router";

export const ItemGrid = DataGrid.define<Item, ItemFilter, Item["Id"]>({
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
