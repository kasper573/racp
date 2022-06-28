import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { Header } from "../layout/Header";
import { useSearchItemsQuery } from "../client";
import { Link } from "../components/Link";
import { router } from "../router";
import { Item } from "../../api/services/item.types";
import { typedKeys } from "../../lib/typedKeys";
import { DataGrid } from "../components/DataGrid";

export default function ItemSearchPage() {
  return (
    <>
      <Header>Item Search</Header>
      <DataGrid columns={itemColumns} query={useSearchItemsQuery} />
    </>
  );
}

const fields: Partial<Record<keyof Item, string>> = {
  Buy: "Buy",
  Sell: "Sell",
  Weight: "Weight",
  Attack: "Atk",
  MagicAttack: "MAtk",
  Defense: "Def",
  EquipLevelMin: "Min Level",
  EquipLevelMax: "Max Level",
};

const itemColumns = [
  {
    field: "Name",
    width: 300,
    renderCell({ value, id }: GridRenderCellParams) {
      return <Link to={router.item().view({ id: id as number })}>{value}</Link>;
    },
  },
  ...typedKeys(fields).map((field) => ({
    field,
    headerName: fields[field],
    renderCell: ({ value }: GridRenderCellParams) => value ?? "-",
  })),
];
