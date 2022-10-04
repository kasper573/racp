import { Button } from "@mui/material";
import { Header } from "../layout/Header";
import { router } from "../router";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { VendorItemGrid } from "../grids/VendorItemGrid";
import { VendorItemSearchFilterForm } from "../forms/VendorItemSearchFilterForm";

export default function VendorItemSearchPage() {
  const [filter = {}, setFilter] = useRouteState(router.vendor, "filter");
  return (
    <>
      <Header>
        Vendings
        <Button
          onClick={() => setFilter({})}
          size="small"
          sx={{ position: "absolute", right: 0 }}
        >
          Clear filters
        </Button>
      </Header>
      <VendorItemSearchFilterForm value={filter} onChange={setFilter} />
      <VendorItemGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
