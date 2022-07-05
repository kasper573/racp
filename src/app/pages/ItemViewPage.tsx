import { useRouteParams } from "react-typesafe-routes";
import { ReactElement } from "react";
import { Stack } from "@mui/material";
import { pick } from "lodash";
import { Header } from "../layout/Header";
import { useGetItemQuery } from "../state/client";
import { router } from "../router";
import { TooltipText } from "../components/TooltipText";
import { ClientTextBlock } from "../components/ClientText/ClientText";
import { TabSwitch } from "../components/TabSwitch";
import { Script } from "../components/Script";
import { resolveToggles } from "../../api/util/matchers";
import { LoadingPage } from "./LoadingPage";

export default function ItemSearchPage(): ReactElement {
  const { id } = useRouteParams(router.item().view);
  const { data: item, isLoading } = useGetItemQuery(id);
  if (isLoading) {
    return <LoadingPage />;
  }
  if (!item) {
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
        {item.Name}&nbsp;
        {hasDifferentDisplayName && (
          <TooltipText tooltip="Client display name" color="text.disabled">
            ({displayName})
          </TooltipText>
        )}
      </Header>

      <TabSwitch
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

      <Stack spacing={3} direction="row" sx={{ mt: 2, width: "100%" }}>
        {scripts.length > 0 && (
          <TabSwitch
            tabs={scripts.map(([label, script]) => ({
              label,
              content: (
                <Script sx={{ maxWidth: 400 }}>{script.raw ?? "-"}</Script>
              ),
            }))}
          />
        )}
        {jobs.length > 0 && (
          <TabSwitch
            tabs={[
              {
                label: "Applicable jobs",
                content: <>{jobs.join(", ")}</>,
              },
            ]}
          />
        )}
      </Stack>
    </>
  );
}
