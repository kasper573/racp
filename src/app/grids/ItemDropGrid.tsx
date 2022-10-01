import { Link } from "../components/Link";
import { router } from "../router";
import { MonsterDrop } from "../../api/services/monster/types";
import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import {
  ItemDrop,
  ItemDropFilter,
  ItemDropId,
} from "../../api/services/drop/types";

export const ItemDropGrid = DataGrid.define<
  ItemDrop,
  ItemDropFilter,
  ItemDropId
>({
  query: trpc.drop.search.useQuery,
  id: (drop) => drop.Id,
  columns: {
    ItemName: {
      headerName: "Name",
      width: 200,
      renderCell({ row: item }) {
        return (
          <Link to={router.item().view({ id: item.ItemId })}>
            {itemNameString(item.ItemName, item.Slots)}
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

export function itemNameString(name: string, slots?: number) {
  return slots !== undefined ? `${name} [${slots}]` : name;
}

export function dropChanceString(drop: MonsterDrop["Rate"]) {
  return `${drop / 1000}%`;
}
