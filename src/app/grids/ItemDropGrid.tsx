import { MonsterDrop } from "../../api/services/monster/types";
import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { ItemIdentifier } from "../components/ItemIdentifier";
import { MonsterIdentifier } from "../components/MonsterIdentifier";

export const ItemDropGrid = DataGrid.define(trpc.drop.search.useQuery)({
  emptyComponent: () => <>No drops found</>,
  id: (drop) => drop.Id,
  columns: {
    MonsterName: {
      headerName: "Monster",
      renderCell({ row: drop }) {
        return (
          <MonsterIdentifier
            name={drop.MonsterName}
            imageUrl={drop.MonsterImageUrl}
            id={drop.MonsterId}
          />
        );
      },
    },
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

export function dropChanceString(rate: MonsterDrop["Rate"]) {
  const percentage = rate / 100;
  return `${
    percentage < 1 ? percentage.toPrecision(1) : Math.round(percentage)
  }%`;
}
