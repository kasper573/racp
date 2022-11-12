import { Header } from "../layout/Header";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";
import { ItemGrid } from "../grids/ItemGrid";
import { routes } from "../router";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { FilterMenu } from "../components/FilterMenu";
import { Page } from "../layout/Page";

export default function ItemSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    routes.item.search.$,
    "filter"
  );
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={ItemSearchFilterForm}
        />
      </Header>
      <ItemGrid filter={filter} sx={{ mt: 1 }} />
    </Page>
  );
}
