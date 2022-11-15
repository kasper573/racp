import { Header } from "../layout/Header";
import { routes } from "../router";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { VendorItemGrid } from "../grids/VendorItemGrid";
import { VendorItemSearchFilterForm } from "../forms/VendorItemSearchFilterForm";
import { FilterMenu } from "../components/FilterMenu";
import { Page } from "../layout/Page";

export default function VendorItemSearchPage() {
  const [query = {}, setQuery] = useRouteState(routes.vendor.$, "query");
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={query.filter ?? {}}
          setFilter={(filter) => setQuery((q) => ({ ...q, filter }))}
          fields={VendorItemSearchFilterForm}
        />
      </Header>
      <VendorItemGrid query={query} setQuery={setQuery} sx={{ mt: 1 }} />
    </Page>
  );
}
