import { Button } from "@mui/material";
import { Header } from "../layout/Header";
import { MonsterSearchFilterForm } from "../forms/MonsterSearchFilterForm";
import { MonsterGrid } from "../grids/MonsterGrid";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { router } from "../router";

export default function MonsterSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    router.monster().search,
    "filter"
  );
  return (
    <>
      <Header>
        Monsters
        <Button
          onClick={() => setFilter({})}
          size="small"
          sx={{ position: "absolute", right: 0 }}
        >
          Clear filters
        </Button>
      </Header>
      <MonsterSearchFilterForm value={filter} onChange={setFilter} />
      <MonsterGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
