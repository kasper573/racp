import { Typography } from "@mui/material";
import { ReactElement } from "react";
import { Header } from "../layout/Header";
import { routes } from "../router";
import { trpc } from "../state/client";
import { ShopItemGrid } from "../grids/ShopItemGrid";
import { Link } from "../components/Link";
import { RouteComponentProps } from "../../lib/tsr/react/types";

export default function ShopViewPage({
  params: { id },
}: RouteComponentProps<{ id: string }>): ReactElement {
  const {
    data: { entities: [shop] = [] } = {},
    error,
    isLoading,
  } = trpc.shop.search.useQuery({
    filter: { id: { value: id, matcher: "equals" } },
    limit: 1,
  });

  if (isLoading) {
    return <></>;
  }

  if (!shop || error) {
    return <Header title="Shop not found" />;
  }

  return (
    <>
      <Header
        title={
          <>
            {shop.name}
            {shop.mapId !== undefined && (
              <>
                &nbsp;@&nbsp;
                <Link
                  to={routes.map.view({
                    id: shop.mapId,
                    pin: { x: shop.mapX, y: shop.mapY },
                  })}
                >
                  {shop.mapId}
                </Link>
              </>
            )}
          </>
        }
      />
      {shop.mapId === undefined && (
        <Typography sx={{ mb: 3 }}>
          This shop is not accessible by clicking on an NPC. It's triggered by a
          script.
        </Typography>
      )}
      <ShopItemGrid
        gridProps={{ columnVisibilityModel: { shopName: false } }}
        filter={{
          shopId: { value: shop.id, matcher: "equals" },
        }}
      />
    </>
  );
}
