import { useState } from "react";
import { Header } from "../layout/Header";
import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import { Monster, MonsterFilter } from "../../api/services/monster/types";
import { useSearchMonstersQuery } from "../state/client";
import { MonsterSearchFilterForm } from "../forms/MonsterSearchFilterForm";

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

const MonsterGrid = DataGrid.define<Monster, MonsterFilter, Monster["Id"]>({
  // Without assertion typescript yields possibly infinite error
  query: useSearchMonstersQuery as unknown as DataGridQueryFn<
    Monster,
    MonsterFilter
  >,
  id: (item) => item.Id,
  columns: {
    Name: true,
    Level: true,
    Atk: "Attack",
    MAtk: "M. Attack",
    Defense: "Defense",
    MagicDefense: "M. Defense",
    Hit: true,
    Flee: true,
    BaseExp: "Base XP",
    JobExp: "Job XP",
    WalkSpeed: "Move Speed",
    AttackRange: "Atk. Range",
    SkillRange: "Skill Range",
    ChaseRange: "Chase Range",
  },
});
