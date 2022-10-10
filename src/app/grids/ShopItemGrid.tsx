import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { ItemIdentifier } from "../components/ItemIdentifier";
import { Zeny } from "../components/Zeny";

export const ShopItemGrid = DataGrid.define(trpc.shop.searchItems.useQuery)({
  emptyComponent: () => <>No items found</>,
  id: (item) => item.id,
  columns: {
    name: {
      headerName: "Name",
      renderCell({ row: item }) {
        return <ItemIdentifier shopItem={item} />;
      },
    },
    price: {
      headerName: "Price",
      renderCell({ value }) {
        return <Zeny variant="body2" value={value} />;
      },
    },
  },
});
