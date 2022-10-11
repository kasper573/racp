import { memo } from "react";
import { MonetizationOn } from "@mui/icons-material";
import { Shop, ShopId } from "../../../../api/services/shop/types";
import { MapPin } from "../MapPin";
import { router } from "../../../router";
import { LinkOnMap, pinIconCss, PinLabel, PinsProps } from "./common";

export const ShopPins = memo(
  ({ entities, show, setHighlightId }: PinsProps<Shop, ShopId>) => {
    return (
      <>
        {show &&
          entities.map((shop, index) => {
            if (shop.mapX !== undefined && shop.mapY !== undefined) {
              const mouseBindings = {
                onMouseOver: () => setHighlightId?.(shop.scriptId),
                onMouseOut: () => setHighlightId?.(undefined),
              };
              return (
                <MapPin
                  key={`shop${index}`}
                  x={shop.mapX}
                  y={shop.mapY}
                  highlightId={shop.scriptId}
                  {...mouseBindings}
                  label={
                    <LinkOnMap
                      to={router.shop({ id: shop.scriptId })}
                      sx={{ lineHeight: "1em" }}
                    >
                      <PinLabel {...mouseBindings} color={shopColor}>
                        {shop.name}
                      </PinLabel>
                    </LinkOnMap>
                  }
                >
                  <MonetizationOn sx={{ ...pinIconCss, color: shopColor }} />
                </MapPin>
              );
            }
            return null;
          })}
      </>
    );
  }
);

const shopColor = "#bbffbb";
