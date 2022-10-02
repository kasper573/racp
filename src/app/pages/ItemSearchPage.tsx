import { Button } from "@mui/material";
import { Header } from "../layout/Header";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";
import { ItemGrid } from "../grids/ItemGrid";
import { router } from "../router";
import { useRouteState } from "../../lib/hooks/useRouteState";

export default function ItemSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    router.item().search,
    "filter"
  );
  return (
    <>
      <Header>
        Items
        <Button
          onClick={() => setFilter({})}
          size="small"
          sx={{ position: "absolute", right: 0 }}
        >
          Clear filters
        </Button>
      </Header>
      <ItemSearchFilterForm value={filter} onChange={setFilter} />
      <ItemGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
