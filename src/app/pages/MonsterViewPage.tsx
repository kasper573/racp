import { ReactElement } from "react";
import { Box, Stack, styled } from "@mui/material";
import { pick } from "lodash";
import { useHistory } from "react-router";
import { useRouteParams } from "../../lib/useRouteParams";
import { Header } from "../layout/Header";
import { useSearchMonstersQuery } from "../state/client";
import { router } from "../router";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { TabSwitch } from "../components/TabSwitch";
import { TabbedPaper } from "../components/TabbedPaper";
import { KVTable } from "../components/KVTable";
import { MonsterDropGrid } from "../grids/MonsterDropGrid";
import { TooltipText } from "../components/TooltipText";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { LoadingPage } from "./LoadingPage";

export default function MonsterViewPage(): ReactElement {
  const history = useHistory();
  const { id, tab = "spawns" } = useRouteParams(router.monster().view);
  const { data, isLoading } = useSearchMonstersQuery({
    filter: { Id: { value: id, matcher: "=" } },
    limit: 1,
  });
  const monster = data?.entities[0];
  const drops = monster ? [...monster.Drops, ...monster.MvpDrops] : [];

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!monster) {
    return <Header>Monster not found</Header>;
  }

  return (
    <>
      <Header back={router.monster}>
        {monster.Name}&nbsp;
        {monster.AegisName !== monster.Name && (
          <TooltipText tooltip="Aegis name" color="text.disabled">
            ({monster.AegisName})
          </TooltipText>
        )}
        <MonsterImage src={monster.ImageUrl} alt={monster.Name} />
      </Header>

      <Stack spacing={2} direction="row" sx={{ flex: 1 }}>
        <Box sx={{ flex: 1 }}>
          <TabbedPaper
            tabs={[
              {
                label: "Properties",
                content: (
                  <KVTable
                    rows={{
                      ...pick(monster, "Id", "Level", "Size", "Race"),
                      Exp: `${monster.BaseExp} Base / ${monster.JobExp} Job / ${monster.MvpExp} Mvp`,
                      Ranges: `${monster.AttackRange} Attack / ${monster.SkillRange} Skill / ${monster.ChaseRange} Chase`,
                      Element: `${monster.Element} (Level ${monster.ElementLevel})`,
                      Modes: Object.keys(monster.Modes).join(", "),
                    }}
                  />
                ),
              },
            ]}
          />
          <TabbedPaper
            tabs={[
              {
                label: "Stats",
                content: (
                  <KVTable
                    rows={pick(
                      monster,
                      "Hp",
                      "Atk",
                      "MAtk",
                      "Defense",
                      "MagicDefense",
                      "Hit",
                      "Flee",
                      "Str",
                      "Agi",
                      "Vit",
                      "Int",
                      "Dex",
                      "Luk",
                      "WalkSpeed"
                    )}
                  />
                ),
              },
            ]}
          />
        </Box>
        <Stack direction="column" sx={{ flex: 1 }}>
          <TabSwitch
            activeTabId={tab}
            onChange={(e, tab) =>
              history.replace(router.monster().view({ id, tab }).$)
            }
            tabs={[
              {
                id: "spawns",
                label: "Spawns",
                content: (
                  <MonsterSpawnGrid
                    filter={{ id: { value: id, matcher: "=" } }}
                    gridProps={{ columnVisibilityModel: { name: false } }}
                  />
                ),
              },
              {
                id: "drops",
                label: "Drops",
                content: <MonsterDropGrid drops={drops} />,
              },
            ]}
          />
        </Stack>
      </Stack>
    </>
  );
}

const MonsterImage = styled(ImageWithFallback)`
  position: absolute;
  margin-left: 12px;
  max-height: 75px;
`;
