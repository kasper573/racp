import { memoize } from "lodash";
import { createYamlResolver } from "../../../rathena/YamlRepository";
import { RAthenaMode } from "../../../options";
import { Monster, MonsterPostProcess, monsterType } from "../types";
import { typedAssign } from "../../../../lib/std/typedAssign";
import { resolveMonsterModes } from "./resolveMonsterModes";

export function createMonsterResolver(rAthenaMode: RAthenaMode) {
  function extract(monster: Monster): MonsterPostProcess {
    const { Level, Agi, Luk, Dex, Attack, Attack2 } = monster;
    return {
      Flee: monster.Flee ?? 100 + (Level + Agi + Luk / 5),
      Hit: monster.Hit ?? 175 + Level + Dex + Math.floor(Luk / 3),
      ...{
        Prerenewal: { Atk: Attack, MAtk: 0 },
        Renewal: { Atk: Attack, MAtk: Attack2 },
      }[rAthenaMode],
    };
  }

  const memoizedModeResolver = memoize(resolveMonsterModes);

  return createYamlResolver(monsterType, {
    getKey: (monster) => monster.Id,
    postProcess(monster) {
      typedAssign(monster, extract(monster));
      typedAssign(
        monster.Modes,
        memoizedModeResolver(monster.Ai, monster.Class)
      );
    },
  });
}
