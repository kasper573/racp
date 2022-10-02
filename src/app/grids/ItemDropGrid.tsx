import { Link } from "../components/Link";
import { router } from "../router";
import { MonsterDrop } from "../../api/services/monster/types";
import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { ItemDisplayName } from "../util/ItemDisplayName";

export const ItemDropGrid = DataGrid.define(trpc.drop.search.useQuery)({
  id: (drop) => drop.Id,
  columns: {
    ItemName: {
      headerName: "Name",
      width: 200,
      renderCell({ row: drop }) {
        return (
          <Link to={router.item().view({ id: drop.ItemId })}>
            <ItemDisplayName name={drop.ItemName} slots={drop.Slots} />
          </Link>
        );
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
