import { useRouteParams } from "react-typesafe-routes";
import { ReactElement } from "react";
import { Header } from "../layout/Header";
import { useGetItemQuery } from "../state/client";
import { router } from "../router";
import { TooltipText } from "../components/TooltipText";
import { ClientTextBlock } from "../components/ClientText/ClientText";
import { TabSwitch } from "../components/TabSwitch";
import { defined } from "../../lib/defined";
import { Script } from "../components/Script";
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

      {item.Info?.identifiedDescriptionName ? (
        <ClientTextBlock lines={item.Info.identifiedDescriptionName} />
      ) : (
        "This item has no description"
      )}

      <TabSwitch
        sx={{ maxWidth: 425, mt: 2 }}
        tabs={defined([
          {
            label: "Script",
            content: <Script>{item.Script?.raw}</Script>,
          },
          item.EquipScript && {
            label: "Equip Script",
            content: <Script>{item.EquipScript?.raw ?? "-"}</Script>,
          },
          item.UnEquipScript && {
            label: "Unequip Script",
            content: <Script>{item.UnEquipScript?.raw ?? "-"}</Script>,
          },
        ])}
      />
    </>
  );
}
