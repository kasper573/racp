import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { ItemIdentifier } from "../components/ItemIdentifier";
import { Zeny } from "../components/Zeny";
import { Item } from "../../api/services/item/types";

export const itemGridColumns = {
  Name: {
    renderCell({ row: item }: { row: Item }) {
      return <ItemIdentifier item={item} />;
    },
  },
  Sell: {
    headerName: "Sell Value",
    renderCell({ row: item }: { row: Item }) {
      return item.Sell !== undefined ? <Zeny value={item.Sell} /> : undefined;
    },
  },
  Weight: "Weight",
  Attack: "Atk",
  MagicAttack: "MAtk",
  Defense: "Def",
  EquipLevelMin: "Min Level",
  EquipLevelMax: "Max Level",
  Slots: "Slots",
};

export const ItemGrid = DataGrid.define(trpc.item.search.useQuery)({
  emptyComponent: () => <>No items found</>,
  id: (item) => item.Id,
  columns: itemGridColumns,
});
