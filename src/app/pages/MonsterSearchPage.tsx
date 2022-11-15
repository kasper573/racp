import { Header } from "../layout/Header";
import { MonsterSearchFilterForm } from "../forms/MonsterSearchFilterForm";
import { MonsterGrid } from "../grids/MonsterGrid";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { routes } from "../router";
import { FilterMenu } from "../components/FilterMenu";
import { Page } from "../layout/Page";

export default function MonsterSearchPage() {
  const [query = {}, setQuery] = useRouteState(
    routes.monster.search.$,
    "query"
  );
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={query.filter ?? {}}
          setFilter={(filter) => setQuery((q) => ({ ...q, filter }))}
          fields={MonsterSearchFilterForm}
        />
      </Header>
      <MonsterGrid query={query} setQuery={setQuery} sx={{ mt: 1 }} />
    </Page>
  );
}
