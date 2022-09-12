import { capitalize } from "lodash";
import { createYamlResolver } from "../../../rathena/YamlDriver";
import { RAthenaMode } from "../../../options";
import { Monster, MonsterPostProcess, monsterType } from "../types";
import { typedAssign } from "../../../../lib/typedAssign";
import { Linker } from "../../../../lib/createPublicFileLinker";

export function createMonsterResolver(
  rAthenaMode: RAthenaMode,
  imageLinker: Linker,
  imageFileExtension: string
) {
  function extract(monster: Monster): MonsterPostProcess {
    const { Level, Agi, Luk, Dex, Attack, Attack2 } = monster;
    return {
      displayName: monsterDisplayName(monster),
      Flee: monster.Flee ?? 100 + (Level + Agi + Luk / 5),
      Hit: monster.Hit ?? 175 + Level + Dex + Math.floor(Luk / 3),
      imageUrl: imageLinker.url(imageName(monster, imageFileExtension)),
      ...{
        Prerenewal: { Atk: Attack, MAtk: 0 },
        Renewal: { Atk: Attack, MAtk: Attack2 },
      }[rAthenaMode],
    };
  }

  return createYamlResolver(monsterType, {
    getKey: (monster) => monster.Id,
    postProcess(monster) {
      typedAssign(monster, extract(monster));
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
