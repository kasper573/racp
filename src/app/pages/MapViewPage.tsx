import { Header } from "../layout/Header";
import { useGetMapQuery } from "../state/client";
import { router } from "../router";
import { useRouteParams } from "../../lib/useRouteParams";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const { id } = useRouteParams(router.map().view);
  const { data: map, isLoading } = useGetMapQuery(id);
  if (isLoading) {
    return <LoadingPage />;
  }
  if (!map) {
    return <Header>Map not found</Header>;
  }

  return (
    <>
      <Header back={router.map}>{map.displayName}</Header>
    </>
  );
}
