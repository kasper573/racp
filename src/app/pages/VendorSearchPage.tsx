import { Button } from "@mui/material";
import { Header } from "../layout/Header";
import { router } from "../router";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { VendorItemGrid } from "../grids/VendorItemGrid";

export default function VendorSearchPage() {
  const [filter = {}, setFilter] = useRouteState(router.vendor, "filter");
  return (
    <>
      <Header>
        Vendor
        <Button
          onClick={() => setFilter({})}
          size="small"
          sx={{ position: "absolute", right: 0 }}
        >
          Clear filters
        </Button>
      </Header>
      <VendorItemGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
