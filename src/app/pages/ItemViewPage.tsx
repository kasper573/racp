import { Fragment, ReactElement } from "react";
import { Stack, styled } from "@mui/material";
import { pick } from "lodash";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { router } from "../router";
import { TooltipText } from "../components/TooltipText";
import { ClientTextBlock } from "../components/ClientText/ClientText";
import { TabbedPaper } from "../components/TabbedPaper";
import { Script } from "../components/Script";
import { resolveToggles } from "../../api/util/matcher";
import { DataGridQueryFn } from "../components/DataGrid";
import { dropChanceString, itemNameString } from "../grids/ItemDropGrid";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { ItemDrop, ItemDropFilter } from "../../api/services/drop/types";
import { Link } from "../components/Link";
import { LoadingPage } from "./LoadingPage";

export default function ItemViewPage(): ReactElement {
  const { id } = useRouteParams(router.item().view);
  const { data: item, isLoading, error } = trpc.item.read.useQuery(id);
  const { data: { entities: drops = [] } = {} } = (
    trpc.drop.search.useQuery as unknown as DataGridQueryFn<
      ItemDrop,
      ItemDropFilter
    >
  )({
    filter: { ItemId: { value: id, matcher: "=" } },
    sort: [{ field: "Rate", sort: "desc" }],
  });

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!item || error) {
    return <Header>Item not found</Header>;
  }
  const displayName = item.Info?.identifiedDisplayName?.content;
  const hasDifferentDisplayName =
    displayName !== undefined && displayName !== item.Name;

  const jobs = resolveToggles(item.Jobs);
  const scripts = Object.entries(
    pick(item, "Script", "EquipScript", "UnEquipScript")
  );

  return (
    <>
      <Header back={router.item}>
        {itemNameString(item.Name, item.Slots)}&nbsp;
        {hasDifferentDisplayName && (
          <TooltipText tooltip="Client display name" color="text.disabled">
            ({itemNameString(displayName, item.Slots)})
          </TooltipText>
        )}
        <ItemImage src={item.ImageUrl} alt={item.Name} />
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

        <Stack spacing={3} direction="row" sx={{ width: "100%" }}>
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
                content: <>{jobs.length > 0 ? jobs.join(", ") : "None"}</>,
              },
            ]}
          />
          <TabbedPaper
            tabs={[
              {
                label: "Dropped by",
                content: (
                  <>
                    {drops.map((drop, index) => (
                      <Fragment key={drop.Id}>
                        <span>
                          <Link
                            to={router.monster().view({ id: drop.MonsterId })}
                            sx={{ whiteSpace: "noWrap" }}
                          >
                            {drop.MonsterName}{" "}
                          </Link>
                          {drop ? `(${dropChanceString(drop.Rate)})` : ""}
                        </span>
                        {index !== drops.length - 1 && ", "}
                      </Fragment>
                    ))}
                    {drops.length === 0 && "None"}
                  </>
                ),
              },
            ]}
          />
        </Stack>
      </Stack>
    </>
  );
}

const ItemImage = styled(ImageWithFallback)`
  position: absolute;
  margin-left: 12px;
  max-height: 75px;
`;
