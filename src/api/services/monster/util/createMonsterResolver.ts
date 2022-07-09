import { createYamlResolver } from "../../../rathena/YamlDriver";
import { RAthenaMode } from "../../../options";
import { monsterType } from "../types";
import { typedAssign } from "../../../../lib/typedAssign";

export function createMonsterResolver(mode: RAthenaMode) {
  return createYamlResolver(monsterType, {
    getKey: (monster) => monster.Id,
    postProcess(monster) {
      const { Level, Agi, Luk, Dex, Attack, Attack2 } = monster;
      monster.Flee = monster.Flee ?? 100 + (Level + Agi + Luk / 5);
      monster.Hit = monster.Hit ?? 175 + Level + Dex + Math.floor(Luk / 3);
      typedAssign(
        monster,
        {
          Prerenewal: { Atk: Attack, MAtk: 0 },
          Renewal: { Atk: Attack, MAtk: Attack2 },
        }[mode]
      );
    },
  });
}
