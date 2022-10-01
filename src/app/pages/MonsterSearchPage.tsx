import { useState } from "react";
import { Button } from "@mui/material";
import { Header } from "../layout/Header";
import { MonsterFilter } from "../../api/services/monster/types";
import { MonsterSearchFilterForm } from "../forms/MonsterSearchFilterForm";
import { MonsterGrid } from "../grids/MonsterGrid";

export default function MonsterSearchPage() {
  const [filter, setFilter] = useState<MonsterFilter>({});
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
