import { useRouteParams } from "react-typesafe-routes";
import { ReactElement } from "react";
import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { useGetItemQuery } from "../state/client";
import { router } from "../router";
import { clientTextToString } from "../../api/common/clientTextType";
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
  return (
    <>
      <Header back={router.item}>{item.Name}</Header>
      <Typography whiteSpace="pre">
        {item.Info?.identifiedDescriptionName
          .map(clientTextToString)
          .join("\n")}
      </Typography>
    </>
  );
}
