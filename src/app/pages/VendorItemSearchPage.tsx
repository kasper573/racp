import { Header } from "../layout/Header";
import { routes } from "../router";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { VendorItemGrid } from "../grids/VendorItemGrid";
import { VendorItemSearchFilterForm } from "../forms/VendorItemSearchFilterForm";
import { FilterMenu } from "../components/FilterMenu";

export default function VendorItemSearchPage() {
  const [filter = {}, setFilter] = useRouteState(routes.vendor.$, "filter");
  return (
    <>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={VendorItemSearchFilterForm}
        />
      </Header>
      <VendorItemGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
