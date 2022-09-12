import { capitalize } from "lodash";
import { createYamlResolver } from "../../../rathena/YamlDriver";
import { RAthenaMode } from "../../../options";
import { Monster, monsterType } from "../types";
import { typedAssign } from "../../../../lib/typedAssign";
import { Linker } from "../../../../lib/createPublicFileLinker";

export function createMonsterResolver(
  rAthenaMode: RAthenaMode,
  imageLinker: Linker,
  imageFileExtension: string
) {
  return createYamlResolver(monsterType, {
    getKey: (monster) => monster.Id,
    postProcess(monster) {
      const { Level, Agi, Luk, Dex, Attack, Attack2 } = monster;
      monster.displayName = monsterDisplayName(monster);
      monster.Flee = monster.Flee ?? 100 + (Level + Agi + Luk / 5);
      monster.Hit = monster.Hit ?? 175 + Level + Dex + Math.floor(Luk / 3);
      monster.imageUrl = imageLinker.url(
        imageName(monster, imageFileExtension)
      );
      typedAssign(
        monster,
        {
          Prerenewal: { Atk: Attack, MAtk: 0 },
          Renewal: { Atk: Attack, MAtk: Attack2 },
        }[rAthenaMode]
      );
    },
  });
}

const imageName = (m: Monster, ext: string) => m.AegisName.toLowerCase() + ext;

const monsterDisplayName = (monster: Monster) =>
  monster.AegisName.toLowerCase()
    .replace(/(\w+)_(\w+)/, "$1 $2")
    .split(/\s+/)
    .map(capitalize)
    .join(" ");
