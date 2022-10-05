import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";
import { IconWithLabel } from "../components/IconWithLabel";

export const MonsterGrid = DataGrid.define(trpc.monster.search.useQuery)({
  emptyComponent: () => <>No monsters found</>,
  id: (item) => item.Id,
  columns: {
    Name: {
      renderCell({ row: monster }) {
        return (
          <IconWithLabel alt={monster.Name} src={monster.ImageUrl}>
            <Link to={router.monster().view({ id: monster.Id })}>
              {monster.Name}
            </Link>
          </IconWithLabel>
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
