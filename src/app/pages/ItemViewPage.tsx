import { useRouteParams } from "react-typesafe-routes";
import { Header } from "../layout/Header";
import { useGetItemQuery } from "../client";
import { router } from "../router";

export default function ItemSearchPage() {
  const { id } = useRouteParams(router.item().view);
  const { data: item } = useGetItemQuery(id);
  if (!item) {
    return <Header>Item not found</Header>;
  }
  return (
    <>
      <Header back={router.item}>{item.Name}</Header>
    </>
  );
}
