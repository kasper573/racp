import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { ItemIdentifier } from "../components/ItemIdentifier";
import { Zeny } from "../components/Zeny";

export const ItemGrid = DataGrid.define(trpc.item.search.useQuery)({
  emptyComponent: () => <>No items found</>,
  id: (item) => item.Id,
  columns: {
    Name: {
      renderCell({ row: item }) {
        return <ItemIdentifier item={item} />;
      },
    },
    Buy: {
      renderCell({ row: item }) {
        return item.Buy !== undefined ? (
          <Zeny variant="body2" value={item.Buy} />
        ) : (
          "-"
        );
      },
    },
    Sell: {
      renderCell({ row: item }) {
        return item.Sell !== undefined ? (
          <Zeny variant="body2" value={item.Sell} />
        ) : (
          "-"
        );
      },
    },
    Weight: "Weight",
    Attack: "Atk",
    MagicAttack: "MAtk",
    Defense: "Def",
    EquipLevelMin: "Min Level",
    EquipLevelMax: "Max Level",
    Slots: "Slots",
  },
});
