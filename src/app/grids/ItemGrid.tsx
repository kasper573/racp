import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { ItemIdentifier } from "../components/ItemIdentifier";

export const ItemGrid = DataGrid.define(trpc.item.search.useQuery)({
  id: (item) => item.Id,
  columns: {
    Name: {
      renderCell({ row: item }) {
        return <ItemIdentifier item={item} />;
      },
    },
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
