import { Header } from "../layout/Header";
import { MonsterSearchFilterForm } from "../forms/MonsterSearchFilterForm";
import { MonsterGrid } from "../grids/MonsterGrid";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { router } from "../router";
import { FilterMenu } from "../components/FilterMenu";

export default function MonsterSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    router.monster().search,
    "filter"
  );
  return (
    <>
      <Header>
        Monsters
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={MonsterSearchFilterForm}
        />
      </Header>
      <MonsterGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
