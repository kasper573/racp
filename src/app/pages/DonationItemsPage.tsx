import { Header } from "../layout/Header";
import { ItemGrid } from "../grids/ItemGrid";
import { trpc } from "../state/client";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { router } from "../router";
import { FilterMenu } from "../components/FilterMenu";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";

export default function DonationItemsPage() {
  const [filter = {}, setFilter] = useRouteState(
    router.donation().items,
    "filter"
  );
  return (
    <>
      <Header back={router.donation}>
        Items
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={(props) => (
            <ItemSearchFilterForm {...props} showPriceFields />
          )}
        />
      </Header>
      <ItemGrid
        query={trpc.donation.searchItems.useQuery}
        filter={filter}
        columns={({ Name, Sell, ...rest }) => ({
          Name,
          Buy: {
            headerName: "Price",
            minWidth: 150,
            renderCell({ row: item }) {
              return `${item.Buy} credits`;
            },
          },
          ...rest,
        })}
      />
    </>
  );
}
