import { ReactElement } from "react";
import { useRouteParams } from "../../lib/useRouteParams";
import { Header } from "../layout/Header";
import { useSearchMonstersQuery } from "../state/client";
import { router } from "../router";
import { LoadingPage } from "./LoadingPage";

export default function MonsterViewPage(): ReactElement {
  const { id } = useRouteParams(router.monster().view);
  const { data, isLoading } = useSearchMonstersQuery({
    filter: { Id: { value: id, matcher: "=" } },
    limit: 1,
  });
  const monster = data?.entities[0];
  if (isLoading) {
    return <LoadingPage />;
  }
  if (!monster) {
    return <Header>Monster not found</Header>;
  }

  return (
    <>
      <Header back={router.monster}>{monster.Name}</Header>
    </>
  );
}
