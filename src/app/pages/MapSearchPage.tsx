import { Header } from "../layout/Header";
import { MapSearchFilterForm } from "../forms/MapSearchFilterForm";
import { MapGrid } from "../grids/MapGrid";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { routes } from "../router";
import { FilterMenu } from "../components/FilterMenu";
import { Page } from "../layout/Page";

export default function MapSearchPage() {
  const [query = {}, setQuery] = useRouteState(routes.map.search.$, "query");
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={query.filter ?? {}}
          setFilter={(filter) => setQuery((q) => ({ ...q, filter }))}
          fields={MapSearchFilterForm}
        />
      </Header>
      <MapGrid query={query} setQuery={setQuery} sx={{ mt: 1 }} />
    </Page>
  );
}
