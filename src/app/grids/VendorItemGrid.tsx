import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";
import { formatZeny } from "../util/formatZeny";
import { ItemIdentifier } from "../components/ItemIdentifier";

export const VendorItemGrid = DataGrid.define(trpc.vendor.searchItems.useQuery)(
  {
    id: (item) => item.id,
    columns: {
      name: {
        sortable: false,
        headerName: "Item",
        width: 250,
        renderCell({ row: item }) {
          return <ItemIdentifier vendorItem={item} />;
        },
      },
      price: {
        headerName: "Price",
        renderCell({ value }) {
          return formatZeny(value);
        },
      },
      amount: "Amount",
      vendorTitle: {
        headerName: "Vendor",
        width: 150,
      },
      map: {
        sortable: false,
        headerName: "Location",
        width: 150,
        renderCell({ row: item }) {
          return (
            <Link
              to={router.map().view({ id: item.map, x: item.x, y: item.y })}
            >
              {item.map} ({item.x}, {item.y})
            </Link>
          );
        },
      },
    },
  }
);
