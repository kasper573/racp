import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { routes } from "../router";
import { Link } from "../components/Link";
import { ItemIdentifier } from "../components/ItemIdentifier";
import { Zeny } from "../components/Zeny";

export const VendorItemGrid = DataGrid.define(trpc.vendor.searchItems.useQuery)(
  {
    emptyComponent: () => <>No one is vending anything at the moment</>,
    id: (item) => item.id,
    columns: {
      name: {
        sortable: false,
        headerName: "Item",
        renderCell({ row: item }) {
          return <ItemIdentifier vendorItem={item} />;
        },
      },
      price: {
        headerName: "Price",
        renderCell({ value }) {
          return <Zeny value={value} />;
        },
      },
      amount: "Amount",
      vendorTitle: {
        headerName: "Vendor",
      },
      map: {
        sortable: false,
        headerName: "Location",
        renderCell({ row: item }) {
          return (
            <Link
              to={routes.map.view({
                id: item.map,
                pin: {
                  x: item.x,
                  y: item.y,
                  title: `Vendor: ${item.vendorTitle}`,
                },
              })}
            >
              {item.map} ({item.x}, {item.y})
            </Link>
          );
        },
      },
    },
  }
);
