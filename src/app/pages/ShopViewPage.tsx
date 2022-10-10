import { Header } from "../layout/Header";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { router } from "../router";
import { trpc } from "../state/client";
import { ShopItemGrid } from "../grids/ShopItemGrid";
import { Link } from "../components/Link";
import { LoadingPage } from "./LoadingPage";

export default function ShopViewPage() {
  const { id } = useRouteParams(router.shop);
  const {
    data: { entities: [shop] = [] } = {},
    error,
    isLoading,
  } = trpc.shop.search.useQuery({
    filter: { npcEntityId: { value: id, matcher: "equals" } },
    limit: 1,
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!shop || error) {
    return <Header>Shop not found</Header>;
  }

  return (
    <>
      <Header back={router.item}>
        {shop.name}
        {shop.mapId !== undefined && (
          <>
            &nbsp;@&nbsp;
            <Link
              to={router
                .map()
                .view({ id: shop.mapId, x: shop.mapX, y: shop.mapY })}
            >
              {shop.mapId}
            </Link>
          </>
        )}
      </Header>
      <ShopItemGrid
        gridProps={{ columnVisibilityModel: { shopName: false } }}
        filter={{
          shopId: { value: shop.npcEntityId, matcher: "equals" },
        }}
      />
    </>
  );
}
