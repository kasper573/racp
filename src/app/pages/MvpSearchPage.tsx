import { Header } from "../layout/Header";
import { MvpGrid } from "../grids/MvpGrid";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { router } from "../router";
import { FilterMenu } from "../components/FilterMenu";
import { MvpSearchFilterForm } from "../forms/MvpSearchFilterForm";

export default function MvpSearchPage() {
  const [filter = {}, setFilter] = useRouteState(router.mvps, "filter");
  return (
    <>
      <Header>
        Mvps
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={MvpSearchFilterForm}
        />
      </Header>
      <MvpGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
