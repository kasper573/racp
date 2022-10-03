import { Stack } from "@mui/material";
import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { formatZeny } from "../util/formatZeny";
import { ItemDisplayName } from "../util/ItemDisplayName";

export const VendorItemGrid = DataGrid.define(trpc.vendor.searchItems.useQuery)(
  {
    id: (item) => item.id,
    columns: {
      name: {
        sortable: false,
        headerName: "Item",
        width: 250,
        renderCell({ row: item }) {
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.name}
                sx={{ width: 32 }}
              />
              <Link to={router.item().view({ id: item.itemId })}>
                <ItemDisplayName {...item} />
              </Link>
            </Stack>
          );
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
