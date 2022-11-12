import { Header } from "../layout/Header";
import { routes } from "../router";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { VendorItemGrid } from "../grids/VendorItemGrid";
import { VendorItemSearchFilterForm } from "../forms/VendorItemSearchFilterForm";
import { FilterMenu } from "../components/FilterMenu";
import { Page } from "../layout/Page";

export default function VendorItemSearchPage() {
  const [filter = {}, setFilter] = useRouteState(routes.vendor.$, "filter");
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={VendorItemSearchFilterForm}
        />
      </Header>
      <VendorItemGrid filter={filter} sx={{ mt: 1 }} />
    </Page>
  );
}
