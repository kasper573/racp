import { useRouteParams } from "react-typesafe-routes";
import { ReactElement } from "react";
import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { useGetItemQuery } from "../state/client";
import { router } from "../router";
import { clientTextToString } from "../../api/common/clientTextType";
import { TooltipText } from "../components/TooltipText";
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
  const displayName = clientTextToString(item.Info?.identifiedDisplayName);
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
      <Typography whiteSpace="pre">
        {item.Info?.identifiedDescriptionName
          ? item.Info.identifiedDescriptionName
              .map(clientTextToString)
              .join("\n")
          : "This item has no description"}
      </Typography>
    </>
  );
}
