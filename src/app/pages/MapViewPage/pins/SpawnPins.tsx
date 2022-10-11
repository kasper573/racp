import { memo, useMemo } from "react";
import { PestControlRodent } from "@mui/icons-material";
import {
  MonsterSpawn,
  MonsterSpawnId,
} from "../../../../api/services/monster/types";
import { createMonsterSwarms } from "../createMonsterSwarms";
import { MapPin } from "../MapPin";
import { router } from "../../../router";
import { LinkOnMap, pinIconCss, PinLabel, PinsProps } from "./common";

export const SpawnPins = memo(
  ({ entities, show }: PinsProps<MonsterSpawn, MonsterSpawnId>) => {
    const spawnSwarms = useMemo(
      () => createMonsterSwarms(entities),
      [entities]
    );
    return (
      <>
        {show &&
          spawnSwarms.map((swarm, index) => (
            <MapPin
              key={`monster-swarm${index}`}
              x={swarm.x}
              y={swarm.y}
              highlightId={swarm.all.map((spawn) => spawn.id)}
              label={
                <>
                  {swarm.groups.map((group, index) => (
                    <LinkOnMap
                      key={index}
                      to={router.monster().view({ id: group.id })}
                      sx={{ lineHeight: "1em" }}
                    >
                      <PinLabel color={monsterColor}>
                        {group.name} {group.size > 1 ? `x${group.size}` : ""}
                      </PinLabel>
                    </LinkOnMap>
                  ))}
                </>
              }
            >
              <PestControlRodent sx={{ ...pinIconCss, color: monsterColor }} />
            </MapPin>
          ))}
      </>
    );
  }
);

const monsterColor = "#ff7878";
