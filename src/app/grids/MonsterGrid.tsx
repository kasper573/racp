import { Stack } from "@mui/material";
import { DataGrid } from "../components/DataGrid";
import { Monster, MonsterFilter } from "../../api/services/monster/types";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";
import { ImageWithFallback } from "../components/ImageWithFallback";

export const MonsterGrid = DataGrid.define<
  Monster,
  MonsterFilter,
  Monster["Id"]
>({
  query: trpc.monster.search.useQuery,
  id: (item) => item.Id,
  columns: {
    Name: {
      renderCell({ row: monster }) {
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <ImageWithFallback
              src={monster.ImageUrl}
              alt={monster.Name}
              sx={{ width: 32 }}
            />
            <Link to={router.monster().view({ id: monster.Id })}>
              {monster.Name}
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
