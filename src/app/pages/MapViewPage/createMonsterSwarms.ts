import { groupBy } from "lodash";
import { MonsterSpawn } from "../../../api/services/monster/types";
import { defined } from "../../../lib/std/defined";
import { createSwarms } from "../../../lib/createSwarms";
import { center, distance } from "../../../lib/geometry";

export function createMonsterSwarms(
  spawns: MonsterSpawn[],
  swarmDistance = 15
) {
  const spawnsWithLocations = defined(
    spawns.map(({ x, y, ...props }) =>
      x !== undefined && y !== undefined ? { ...props, x, y } : undefined
    )
  );
  const swarms = createSwarms(
    spawnsWithLocations,
    (a, b) => distance(a, b) <= swarmDistance
  );
  return swarms.map((swarm) => {
    return {
      ...center(swarm),
      all: swarm,
      groups: Object.values(groupBy(swarm, (spawn) => spawn.monsterId)).map(
        (group) => ({
          name: group[0].name,
          id: group[0].monsterId,
          size: group.length,
        })
      ),
    };
  });
}
