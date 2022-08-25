import { DataGrid } from "@mui/x-data-grid";
import { ComponentProps } from "react";
import { Link } from "../components/Link";
import { router } from "../router";
import { MonsterDrop } from "../../api/services/monster/types";

export function MonsterDropGrid({
  drops,
  ...props
}: Omit<ComponentProps<typeof DataGrid>, "columns" | "rows"> & {
  drops: MonsterDrop[];
}) {
  return (
    <DataGrid
      columns={[
        {
          field: "Name",
          headerName: "Name",
          width: 200,
          renderCell({ row: item }) {
            return (
              <Link to={router.item().view({ id: item.ItemId })}>
                {item.Name}
              </Link>
            );
          },
        },
        {
          field: "Rate",
          headerName: "Chance",
          renderCell({ value }) {
            return dropChanceString(value);
          },
        },
      ]}
      rows={drops}
      getRowId={(drop) => drop.ItemId}
      hideFooter
      {...props}
    />
  );
}

export function dropChanceString(drop: MonsterDrop["Rate"]) {
  return `${drop / 1000}%`;
}
