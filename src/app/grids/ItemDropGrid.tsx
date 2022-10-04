import { MonsterDrop } from "../../api/services/monster/types";
import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { ItemIdentifier } from "../components/ItemIdentifier";

export const ItemDropGrid = DataGrid.define(trpc.drop.search.useQuery)({
  id: (drop) => drop.Id,
  columns: {
    ItemName: {
      headerName: "Name",
      renderCell({ row: drop }) {
        return <ItemIdentifier drop={drop} />;
      },
    },
    Rate: {
      headerName: "Chance",
      renderCell({ value }) {
        return dropChanceString(value);
      },
    },
  },
});

export function dropChanceString(drop: MonsterDrop["Rate"]) {
  return `${drop / 100}%`;
}
