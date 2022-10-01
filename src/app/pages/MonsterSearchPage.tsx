import { useState } from "react";
import { Button, styled } from "@mui/material";
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
      <ResponsiveMonsterGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}

const ResponsiveMonsterGrid = styled(MonsterGrid)`
  // Set a fixed grid height whenever the screen size would make the grid too small
  @media (max-height: 558px) {
    height: 782px;
  }
`;
