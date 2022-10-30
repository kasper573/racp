import { memoize } from "lodash";
import { Monster, MonsterPostProcess } from "../types";
import { typedAssign } from "../../../../lib/std/typedAssign";
import { RAthenaMode } from "../../settings/types";
import { resolveMonsterModes } from "./resolveMonsterModes";

const memoizedModeResolver = memoize(resolveMonsterModes);

export function postProcessMonster(
  monster: Monster,
  options: {
    imageUrl?: string;
    rAthenaMode: RAthenaMode;
  }
) {
  const extract = createExtractor(options.rAthenaMode);
  typedAssign(monster, extract(monster));
  typedAssign(monster.Modes, memoizedModeResolver(monster.Ai, monster.Class));
  monster.ImageUrl = options.imageUrl;
}

function createExtractor(rAthenaMode: RAthenaMode) {
  return function extract(monster: Monster): MonsterPostProcess {
    const { Level, Agi, Luk, Dex, Attack, Attack2 } = monster;
    return {
      Flee: monster.Flee ?? 100 + (Level + Agi + Luk / 5),
      Hit: monster.Hit ?? 175 + Level + Dex + Math.floor(Luk / 3),
      ...{
        Prerenewal: { Atk: Attack, MAtk: 0 },
        Renewal: { Atk: Attack, MAtk: Attack2 },
      }[rAthenaMode],
    };
  };
}
