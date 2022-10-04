import { Fragment, ReactElement } from "react";
import { Stack } from "@mui/material";
import { pick } from "lodash";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { router } from "../router";
import { ClientTextBlock } from "../components/ClientText/ClientText";
import { TabbedPaper } from "../components/TabbedPaper";
import { Script } from "../components/Script";
import { resolveToggles } from "../../api/util/matcher";
import { dropChanceString } from "../grids/ItemDropGrid";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { Link } from "../components/Link";
import { CommonPageGrid } from "../components/CommonPageGrid";
import { InfoTooltip } from "../components/InfoTooltip";
import { ItemDisplayName } from "../components/ItemIdentifier";
import { Spaceless } from "../components/Spaceless";
import { LoadingPage } from "./LoadingPage";

export default function ItemViewPage(): ReactElement {
  const { id } = useRouteParams(router.item().view);
  const { data: item, isLoading, error } = trpc.item.read.useQuery(id);
  const { data: { entities: drops = [] } = {} } = trpc.drop.search.useQuery({
    filter: { ItemId: { value: id, matcher: "=" } },
    sort: [{ field: "Rate", sort: "desc" }],
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

  const jobs = resolveToggles(item.Jobs);
  const scripts = Object.entries(
    pick(item, "Script", "EquipScript", "UnEquipScript")
  );

  return (
    <>
      <Header back={router.item}>
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

        <CommonPageGrid variant="grow">
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
        </CommonPageGrid>
      </Stack>
    </>
  );
}
