import { createYamlResolver } from "../../../rathena/YamlDriver";
import { RAthenaMode } from "../../../options";
import { MonsterDropPostProcess, monsterType } from "../types";
import { typedAssign } from "../../../../lib/typedAssign";
import { Item } from "../../item/types";

export function createMonsterResolver(
  rAthenaMode: RAthenaMode,
  itemsByAegisName: Record<string, Item[]>
) {
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
        }[rAthenaMode]
      );
      for (const drop of monster.Drops) {
        const item = itemsByAegisName[drop.Item]?.[0];
        if (item) {
          const props: MonsterDropPostProcess = {
            ItemId: item.Id,
            Name: item.Name,
          };
          typedAssign(drop, props);
        }
      }
    },
  });
}
