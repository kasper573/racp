import { createYamlResolver } from "../../../rathena/YamlDriver";
import { RAthenaMode } from "../../../options";
import { Monster, MonsterPostProcess, monsterType } from "../types";
import { typedAssign } from "../../../../lib/std/typedAssign";

export function createMonsterResolver(rAthenaMode: RAthenaMode) {
  async function extract(monster: Monster): Promise<MonsterPostProcess> {
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

  return createYamlResolver(monsterType, {
    getKey: (monster) => monster.Id,
    async postProcess(monster) {
      typedAssign(monster, await extract(monster));
    },
  });
}
