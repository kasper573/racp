import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import { Monster, MonsterFilter } from "../../api/services/monster/types";
import { useSearchMonstersQuery } from "../state/client";

export const MonsterGrid = DataGrid.define<
  Monster,
  MonsterFilter,
  Monster["Id"]
>({
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
