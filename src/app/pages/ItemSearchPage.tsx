import { Header } from "../layout/Header";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";
import { ItemGrid } from "../grids/ItemGrid";
import { routes } from "../router";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { FilterMenu } from "../components/FilterMenu";
import { Page } from "../layout/Page";

export default function ItemSearchPage() {
  const [query = {}, setQuery] = useRouteState(routes.item.search.$, "query");
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={query.filter ?? {}}
          setFilter={(filter) => setQuery((q) => ({ ...q, filter }))}
          fields={ItemSearchFilterForm}
        />
      </Header>
      <ItemGrid query={query} setQuery={setQuery} sx={{ mt: 1 }} />
    </Page>
  );
}
