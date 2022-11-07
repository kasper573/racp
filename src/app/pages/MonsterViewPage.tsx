import { ReactElement } from "react";
import { Box, Stack } from "@mui/material";
import { pick } from "lodash";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { routes } from "../router";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { TabSwitch } from "../components/TabSwitch";
import { TabbedPaper } from "../components/TabbedPaper";
import { KVTable } from "../components/KVTable";
import { ItemDropGrid } from "../grids/ItemDropGrid";
import { InfoTooltip } from "../components/InfoTooltip";
import { CommonPageGrid } from "../components/CommonPageGrid";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { Spaceless } from "../components/Spaceless";
import { renderToggles } from "../util/renderToggles";
import { useHistory } from "../../lib/tsr/react/useHistory";
import { RouteComponentProps } from "../../lib/tsr/react/types";

export default function MonsterViewPage({
  params: { id, tab },
}: RouteComponentProps<{ id: number; tab: string }>): ReactElement {
  const history = useHistory();
  const { data, isLoading, error } = trpc.monster.search.useQuery({
    filter: { Id: { value: id, matcher: "=" } },
    limit: 1,
  });
  const monster = data?.entities[0];

  if (isLoading) {
    return <></>;
  }
  if (!monster || error) {
    return <Header title="Monster not found" />;
  }

  return (
    <>
      <Header
        title={
          <>
            {monster.Name}&nbsp;
            {monster.AegisName !== monster.Name && (
              <InfoTooltip title="Aegis name">
                ({monster.AegisName})
              </InfoTooltip>
            )}
            <Spaceless offset={{ top: -24, left: 16 }}>
              <ImageWithFallback
                sx={{ maxHeight: 75 }}
                src={monster.ImageUrl}
                alt={monster.Name}
              />
            </Spaceless>
          </>
        }
      />

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
                      Modes: renderToggles(monster.Modes),
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
              history.replace(routes.monster.view({ id, tab }))
            }
            tabs={[
              {
                id: "spawns",
                label: "Spawns",
                content: (
                  <MonsterSpawnGrid
                    filter={{ monsterId: { value: id, matcher: "=" } }}
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
                    gridProps={{
                      columnVisibilityModel: { MonsterName: false },
                    }}
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

// Stress test commit
