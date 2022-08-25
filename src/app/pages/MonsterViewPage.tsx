import { ReactElement } from "react";
import { Box, Stack } from "@mui/material";
import { useRouteParams } from "../../lib/useRouteParams";
import { Header } from "../layout/Header";
import { useSearchMonstersQuery } from "../state/client";
import { router } from "../router";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { TabSwitch } from "../components/TabSwitch";
import { LoadingPage } from "./LoadingPage";

export default function MonsterViewPage(): ReactElement {
  const { id } = useRouteParams(router.monster().view);
  const { data, isLoading } = useSearchMonstersQuery({
    filter: { Id: { value: id, matcher: "=" } },
    limit: 1,
  });
  const monster = data?.entities[0];
  if (isLoading) {
    return <LoadingPage />;
  }
  if (!monster) {
    return <Header>Monster not found</Header>;
  }

  return (
    <>
      <Header back={router.monster}>{monster.Name}</Header>
      <Stack spacing={2} direction="row" sx={{ flex: 1 }}>
        <Box sx={{ flex: 1 }}></Box>
        <Stack direction="column" sx={{ flex: 1 }}>
          <TabSwitch
            tabs={[
              {
                label: "Spawns",
                content: (
                  <MonsterSpawnGrid
                    filter={{ id: { value: id, matcher: "=" } }}
                    gridProps={{ columnVisibilityModel: { name: false } }}
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
