import { Header } from "../layout/Header";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";
import { ItemGrid } from "../grids/ItemGrid";
import { router } from "../router";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { FilterMenu } from "../components/FilterMenu";

export default function ItemSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    router.item.search.$,
    "filter"
  );
  return (
    <>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={ItemSearchFilterForm}
        />
      </Header>
      <ItemGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
