import { Header } from "../layout/Header";
import { useSearchItemsQuery } from "../client";
import { router } from "../router";
import { Item } from "../../api/services/item.types";
import { DataGrid } from "../components/DataGrid";

export default function ItemSearchPage() {
  return (
    <>
      <Header>Item Search</Header>
      <DataGrid<Item, Item["Id"]>
        columns={columns}
        query={useSearchItemsQuery}
        id={(item) => item.Id}
        link={(id) => router.item().view({ id })}
      />
    </>
  );
}

const columns = {
  Name: "Name",
  Buy: "Buy",
  Sell: "Sell",
  Weight: "Weight",
  Attack: "Atk",
  MagicAttack: "MAtk",
  Defense: "Def",
  EquipLevelMin: "Min Level",
  EquipLevelMax: "Max Level",
};
