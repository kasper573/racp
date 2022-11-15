import { ComponentProps } from "react";
import { Header } from "../layout/Header";
import { ItemGrid } from "../grids/ItemGrid";
import { trpc } from "../state/client";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { routes } from "../router";
import { FilterMenu } from "../components/FilterMenu";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";
import { Page } from "../layout/Page";

export default function DonationItemsPage() {
  const [filter = {}, setFilter] = useRouteState(
    routes.donation.items.$,
    "filter"
  );
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={DonationItemsFilterForm}
        />
      </Header>
      <ItemGrid
        queryFn={trpc.donation.searchItems.useQuery}
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
    </Page>
  );
}

const DonationItemsFilterForm = (
  props: ComponentProps<typeof ItemSearchFilterForm>
) => <ItemSearchFilterForm {...props} showPriceFields />;
