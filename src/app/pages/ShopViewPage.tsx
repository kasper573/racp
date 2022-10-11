import { Typography } from "@mui/material";
import { ReactElement } from "react";
import { Header } from "../layout/Header";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { router } from "../router";
import { trpc } from "../state/client";
import { ShopItemGrid } from "../grids/ShopItemGrid";
import { Link } from "../components/Link";
import { LoadingPage } from "./LoadingPage";

export default function ShopViewPage(): ReactElement {
  const { id } = useRouteParams(router.shop);
  const {
    data: { entities: [shop] = [] } = {},
    error,
    isLoading,
  } = trpc.shop.search.useQuery({
    filter: { scriptId: { value: id, matcher: "equals" } },
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
      <Header parent="Shops">
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
      {shop.mapId === undefined && (
        <Typography sx={{ mb: 3 }}>
          This shop is not accessible by clicking on an NPC. It's triggered by a
          script.
        </Typography>
      )}
      <ShopItemGrid
        gridProps={{ columnVisibilityModel: { shopName: false } }}
        filter={{
          shopId: { value: shop.scriptId, matcher: "equals" },
        }}
      />
    </>
  );
}
