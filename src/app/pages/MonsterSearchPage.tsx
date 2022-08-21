import { useState } from "react";
import { Header } from "../layout/Header";
import { MonsterFilter } from "../../api/services/monster/types";
import { MonsterSearchFilterForm } from "../forms/MonsterSearchFilterForm";
import { MonsterGrid } from "../grids/MonsterGrid";

export default function MonsterSearchPage() {
  const [filter, setFilter] = useState<MonsterFilter>({});
  return (
    <>
      <Header>Monsters</Header>
      <MonsterSearchFilterForm value={filter} onChange={setFilter} />
      <MonsterGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
