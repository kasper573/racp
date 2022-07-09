import { useState } from "react";
import { Header } from "../layout/Header";
import { DataGrid } from "../components/DataGrid";
import { Monster, MonsterFilter } from "../../api/services/monster/types";
import { useSearchMonstersQuery } from "../state/client";

export default function MonsterSearchPage() {
  const [filter, setFilter] = useState<MonsterFilter>({});
  return (
    <>
      <Header>Monsters</Header>
      <DataGrid<Monster, MonsterFilter, Monster["Id"]>
        filter={filter}
        columns={columns}
        query={useSearchMonstersQuery}
        id={(item) => item.Id}
      />
    </>
  );
}

const columns = {
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
};
