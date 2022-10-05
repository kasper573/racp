import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { MonsterIdentifier } from "../components/MonsterIdentifier";

export const MonsterGrid = DataGrid.define(trpc.monster.search.useQuery)({
  emptyComponent: () => <>No monsters found</>,
  id: (monster) => monster.Id,
  columns: {
    Name: {
      renderCell({ row: monster }) {
        return (
          <MonsterIdentifier
            name={monster.Name}
            imageUrl={monster.ImageUrl}
            id={monster.Id}
          />
        );
      },
    },
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
