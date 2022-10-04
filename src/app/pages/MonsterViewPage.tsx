import { ReactElement } from "react";
import { Box, Stack } from "@mui/material";
import { pick } from "lodash";
import { useHistory } from "react-router";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { router } from "../router";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { TabSwitch } from "../components/TabSwitch";
import { TabbedPaper } from "../components/TabbedPaper";
import { KVTable } from "../components/KVTable";
import { ItemDropGrid } from "../grids/ItemDropGrid";
import { InfoTooltip } from "../components/InfoTooltip";
import { CommonPageGrid } from "../components/CommonPageGrid";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { Spaceless } from "../components/Spaceless";
import { LoadingPage } from "./LoadingPage";

export default function MonsterViewPage(): ReactElement {
  const history = useHistory();
  const { id, tab = "spawns" } = useRouteParams(router.monster().view);
  const { data, isLoading, error } = trpc.monster.search.useQuery({
    filter: { Id: { value: id, matcher: "=" } },
    limit: 1,
  });
  const monster = data?.entities[0];

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!monster || error) {
    return <Header>Monster not found</Header>;
  }

  return (
    <>
      <Header back={router.monster}>
        {monster.Name}&nbsp;
        {monster.AegisName !== monster.Name && (
          <InfoTooltip title="Aegis name">({monster.AegisName})</InfoTooltip>
        )}
        <Spaceless offset={{ top: -24, left: 16 }}>
          <ImageWithFallback
            sx={{ maxHeight: 75 }}
            src={monster.ImageUrl}
            alt={monster.Name}
          />
        </Spaceless>
      </Header>

      <CommonPageGrid>
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
                content: (
                  <ItemDropGrid
                    filter={{ MonsterId: { value: id, matcher: "=" } }}
                  />
                ),
              },
            ]}
          />
        </Stack>
      </CommonPageGrid>
    </>
  );
}
