import { Fragment, ReactElement } from "react";
import { Box, Paper, Stack } from "@mui/material";
import { pick } from "lodash";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { router } from "../router";
import { ClientTextBlock } from "../components/ClientText/ClientText";
import { TabbedPaper } from "../components/TabbedPaper";
import { Script } from "../components/Script";
import { ItemDropGrid } from "../grids/ItemDropGrid";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { CommonPageGrid } from "../components/CommonPageGrid";
import { InfoTooltip } from "../components/InfoTooltip";
import { ItemDisplayName } from "../components/ItemIdentifier";
import { Spaceless } from "../components/Spaceless";
import { ShopItemGrid } from "../grids/ShopItemGrid";
import { TabSwitch } from "../components/TabSwitch";
import { renderToggles } from "../util/renderToggles";
import { RouteComponentProps } from "../../lib/tsr/react/types";
import { LoadingPage } from "./LoadingPage";

export default function ItemViewPage({
  params: { id },
}: RouteComponentProps<{ id: number }>): ReactElement {
  const { data: item, isLoading, error } = trpc.item.read.useQuery(id);
  const { data: { entities: drops = [] } = {} } = trpc.drop.search.useQuery({
    filter: { ItemId: { value: id, matcher: "=" } },
    sort: [{ field: "Rate", sort: "desc" }],
  });

  const { data: { entities: shopItems = [] } = {} } =
    trpc.shop.searchItems.useQuery({
      filter: { id: { value: id, matcher: "=" } },
    });

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!item || error) {
    return <Header>Item not found</Header>;
  }
  const clientName = item.Info?.identifiedDisplayName?.content;
  const hasDifferentClientName =
    clientName !== undefined && clientName !== item.Name;

  const scripts = Object.entries(
    pick(item, "Script", "EquipScript", "UnEquipScript")
  );

  return (
    <>
      <Header back={router.item.$}>
        <ItemDisplayName name={item.Name} slots={item.Slots} />
        &nbsp;
        {hasDifferentClientName && (
          <InfoTooltip title="Client display name">({clientName})</InfoTooltip>
        )}
        <Spaceless offset={{ top: -10, left: 16 }}>
          <ImageWithFallback
            sx={{ maxHeight: 75 }}
            src={item.ImageUrl}
            alt={item.Name}
          />
        </Spaceless>
      </Header>

      <Stack spacing={2} sx={{ flex: 1 }} direction="column">
        <TabbedPaper
          tabs={[
            {
              label: "Description",
              content: item.Info?.identifiedDescriptionName ? (
                <ClientTextBlock lines={item.Info.identifiedDescriptionName} />
              ) : (
                <>This item has no description</>
              ),
            },
          ]}
        />

        <CommonPageGrid>
          {scripts.length > 0 && (
            <TabbedPaper
              tabs={scripts.map(([label, script]) => ({
                label,
                content: (
                  <Script sx={{ maxWidth: 400 }}>{script.raw ?? "-"}</Script>
                ),
              }))}
            />
          )}
          <TabbedPaper
            tabs={[
              {
                label: "Applicable jobs",
                content: <>{renderToggles(item.Jobs)}</>,
              },
            ]}
          />
          <Box>
            <TabSwitch
              tabs={[
                {
                  label: "Dropped by",
                  content:
                    drops.length > 0 ? (
                      <ItemDropGrid
                        data={drops}
                        gridProps={{
                          columnVisibilityModel: { ItemName: false },
                        }}
                      />
                    ) : (
                      <Paper sx={{ p: 2 }}>None</Paper>
                    ),
                },
              ]}
            />
          </Box>
          <Box>
            <TabSwitch
              tabs={[
                {
                  label: "Sold by",
                  content:
                    shopItems.length > 0 ? (
                      <ShopItemGrid
                        data={shopItems}
                        gridProps={{ columnVisibilityModel: { name: false } }}
                      />
                    ) : (
                      <Paper sx={{ p: 2 }}>None</Paper>
                    ),
                },
              ]}
            />
          </Box>
        </CommonPageGrid>
      </Stack>
    </>
  );
}
