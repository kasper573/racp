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
import { Monster, MonsterFilter } from "../../api/services/monster/types";
import { Link } from "../components/Link";
import { dropChanceString, itemNameString } from "../grids/MonsterDropGrid";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { LoadingPage } from "./LoadingPage";

export default function ItemViewPage(): ReactElement {
  const { id } = useRouteParams(router.item().view);
  const { data: item, isLoading, error } = trpc.item.getItem.useQuery(id);
  const { data: { entities: droppedBy = [] } = {} } = (
    trpc.monster.searchMonsters.useQuery as unknown as DataGridQueryFn<
      Monster,
      MonsterFilter
    >
  )({
    filter: { Id: { value: item?.DroppedBy ?? [], matcher: "oneOfN" } },
    limit: item?.DroppedBy?.length,
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

  const droppers = droppedBy
    .map((monster) => {
      const drop = [...monster.Drops, ...monster.MvpDrops].find(
        (drop) => drop.ItemId === item.Id
      );
      return {
        monster,
        drop,
      };
    })
    .sort((a, b) => (b.drop?.Rate ?? 0) - (a.drop?.Rate ?? 0));

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

      <Stack spacing={2} direction="column">
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
                    {droppers.map(({ monster, drop }, index) => (
                      <Fragment key={index}>
                        <span>
                          <Link
                            to={router.monster().view({ id: monster.Id })}
                            sx={{ whiteSpace: "noWrap" }}
                          >
                            {monster.Name}{" "}
                          </Link>
                          {drop ? `(${dropChanceString(drop.Rate)})` : ""}
                        </span>
                        {index !== droppedBy.length - 1 && ", "}
                      </Fragment>
                    ))}
                    {droppers.length === 0 && "None"}
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
