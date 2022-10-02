import { Button } from "@mui/material";
import { Header } from "../layout/Header";
import { MapSearchFilterForm } from "../forms/MapSearchFilterForm";
import { MapGrid } from "../grids/MapGrid";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { router } from "../router";

export default function MapSearchPage() {
  const [filter = {}, setFilter] = useRouteState(router.map().search, "filter");
  return (
    <>
      <Header>
        Maps
        <Button
          onClick={() => setFilter({})}
          size="small"
          sx={{ position: "absolute", right: 0 }}
        >
          Clear filters
        </Button>
      </Header>
      <MapSearchFilterForm value={filter} onChange={setFilter} />
      <MapGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
