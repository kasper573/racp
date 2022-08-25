import { ReactElement } from "react";
import { Box, Stack } from "@mui/material";
import { pick } from "lodash";
import { DataGrid } from "@mui/x-data-grid";
import { useHistory } from "react-router";
import { useRouteParams } from "../../lib/useRouteParams";
import { Header } from "../layout/Header";
import { useSearchMonstersQuery } from "../state/client";
import { router } from "../router";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { TabSwitch } from "../components/TabSwitch";
import { TabbedPaper } from "../components/TabbedPaper";
import { Link } from "../components/Link";
import { useRichDrops } from "../hooks/useRichDrops";
import { KVTable } from "../components/KVTable";
import { LoadingPage } from "./LoadingPage";

export default function MonsterViewPage(): ReactElement {
  const history = useHistory();
  const { id, tab = "spawns" } = useRouteParams(router.monster().view);
  const { data, isLoading } = useSearchMonstersQuery({
    filter: { Id: { value: id, matcher: "=" } },
    limit: 1,
  });
  const monster = data?.entities[0];
  const drops = useRichDrops(monster);

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!monster) {
    return <Header>Monster not found</Header>;
  }

  const dropNames = monster.Drops.map((drop) => drop.Item);
  return (
    <>
      <Header back={router.monster}>{monster.Name}&nbsp;</Header>
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
                content: (
                  <DataGrid
                    columns={[
                      {
                        field: "Name",
                        headerName: "Name",
                        width: 200,
                        renderCell({ row: item }) {
                          return (
                            <Link to={router.item().view({ id: item.Id })}>
                              {item.Name}
                            </Link>
                          );
                        },
                      },
                      {
                        field: "Rate",
                        headerName: "Chance",
                        renderCell({ value }) {
                          return value / 1000 + "%";
                        },
                      },
                    ]}
                    rows={drops}
                    getRowId={(drop) => drop.Id}
                    hideFooter
                  />
                ),
              },
            ]}
          />
        </Stack>
      </Stack>
    </>
  );
}
