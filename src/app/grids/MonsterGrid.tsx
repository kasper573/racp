import { Stack } from "@mui/material";
import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import { Monster, MonsterFilter } from "../../api/services/monster/types";
import { useSearchMonstersQuery } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";

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
    Name: {
      renderCell({ row: monster }) {
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <img src={monster.ImageUrl} alt="" width={32} />
            <Link to={router.monster().view({ id: monster.Id })}>
              {monster.DisplayName}
            </Link>
          </Stack>
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
