import { useRouteParams } from "react-typesafe-routes";
import { Header } from "../layout/Header";
import { useGetItemQuery } from "../client";
import { router } from "../router";
import { LoadingPage } from "./LoadingPage";

export default function ItemSearchPage() {
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
    </>
  );
}
