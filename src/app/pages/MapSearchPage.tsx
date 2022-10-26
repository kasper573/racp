import { Header } from "../layout/Header";
import { MapSearchFilterForm } from "../forms/MapSearchFilterForm";
import { MapGrid } from "../grids/MapGrid";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { router } from "../router";
import { FilterMenu } from "../components/FilterMenu";

export default function MapSearchPage() {
  const [filter = {}, setFilter] = useRouteState(router.map.search, "filter");
  return (
    <>
      <Header>
        Maps
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={MapSearchFilterForm}
        />
      </Header>
      <MapGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
