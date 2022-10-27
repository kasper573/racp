import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { ItemIdentifier } from "../components/ItemIdentifier";
import { Zeny } from "../components/Zeny";
import { Link } from "../components/Link";
import { routes } from "../router";

export const ShopItemGrid = DataGrid.define(trpc.shop.searchItems.useQuery)({
  emptyComponent: () => <>No items found</>,
  id: (item) => `${item.shopId}-${item.id}`,
  columns: {
    shopName: {
      headerName: "Shop",
      renderCell({ row: item }) {
        return (
          <>
            <Link to={routes.shop({ id: item.shopId })}>{item.shopName}</Link>
            {item.shopMap && (
              <>
                &nbsp; (
                <Link to={routes.map.view(item.shopMap)}>
                  {item.shopMap.id}
                </Link>
                )
              </>
            )}
          </>
        );
      },
    },
    name: {
      headerName: "Name",
      renderCell({ row: item }) {
        return <ItemIdentifier shopItem={item} />;
      },
    },
    price: {
      headerName: "Price",
      renderCell({ value }) {
        return <Zeny value={value} />;
      },
    },
  },
});
