import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { ItemIdentifier } from "../components/ItemIdentifier";
import { MonsterIdentifier } from "../components/MonsterIdentifier";
import { dropRateString } from "../util/formatters";

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
        return dropRateString(value);
      },
    },
  },
});
