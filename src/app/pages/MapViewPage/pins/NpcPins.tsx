import { memo } from "react";
import { PriorityHigh } from "@mui/icons-material";
import { Npc, NpcId } from "../../../../api/services/npc/types";
import { MapPin } from "../MapPin";
import { routes } from "../../../router";
import { LinkOnMap, pinIconCss, PinLabel, PinsProps } from "./common";

export const NpcPins = memo(
  ({ entities, show, setHighlightId }: PinsProps<Npc, NpcId>) => {
    return (
      <>
        {show &&
          entities.map((npc, index) => {
            const mouseBindings = {
              onMouseOver: () => setHighlightId?.(npc.id),
              onMouseOut: () => setHighlightId?.(undefined),
            };
            return (
              <MapPin
                key={`npc${index}`}
                x={npc.mapX}
                y={npc.mapY}
                highlightId={npc.id}
                {...mouseBindings}
                label={
                  <LinkOnMap
                    to={routes.map.view({
                      id: npc.mapId,
                      x: npc.mapX,
                      y: npc.mapY,
                      tab: "npcs",
                    })}
                    sx={{ lineHeight: "1em" }}
                  >
                    <PinLabel {...mouseBindings} color={npcColor}>
                      {npc.name}
                    </PinLabel>
                  </LinkOnMap>
                }
              >
                <PriorityHigh sx={{ ...pinIconCss, color: npcColor }} />
              </MapPin>
            );
          })}
      </>
    );
  }
);

const npcColor = "#f1b072";
