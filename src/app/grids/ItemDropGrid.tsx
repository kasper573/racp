import { Link } from "../components/Link";
import { router } from "../router";
import { MonsterDrop } from "../../api/services/monster/types";
import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { itemDisplayName } from "../../api/services/item/util/itemDisplayName";

export const ItemDropGrid = DataGrid.define(trpc.drop.search.useQuery)({
  id: (drop) => drop.Id,
  columns: {
    ItemName: {
      headerName: "Name",
      width: 200,
      renderCell({ row: item }) {
        return (
          <Link to={router.item().view({ id: item.ItemId })}>
            {itemDisplayName(item.ItemName, { slots: item.Slots })}
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
