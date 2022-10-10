import { Header } from "../layout/Header";
import { router } from "../router";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { FilterMenu } from "../components/FilterMenu";
import { ShopGrid } from "../grids/ShopGrid";
import { ShopSearchFilterForm } from "../forms/ShopSearchFilterForm";

export default function ShopSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    router.shop().search,
    "filter"
  );
  return (
    <>
      <Header>
        Shops
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={ShopSearchFilterForm}
        />
      </Header>
      <ShopGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
