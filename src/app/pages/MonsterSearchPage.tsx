import { Header } from "../layout/Header";
import { MonsterSearchFilterForm } from "../forms/MonsterSearchFilterForm";
import { MonsterGrid } from "../grids/MonsterGrid";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { routes } from "../router";
import { FilterMenu } from "../components/FilterMenu";
import { Page } from "../layout/Page";

export default function MonsterSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    routes.monster.search.$,
    "filter"
  );
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={MonsterSearchFilterForm}
        />
      </Header>
      <MonsterGrid filter={filter} sx={{ mt: 1 }} />
    </Page>
  );
}
