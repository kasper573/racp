import * as fs from "fs";
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
  async function extract(monster: Monster): Promise<MonsterPostProcess> {
    const { Level, Agi, Luk, Dex, Attack, Attack2 } = monster;
    const imageName = createImageName(monster, imageFileExtension);
    const ImageUrl = (await exists(imageLinker.path(imageName)))
      ? imageLinker.url(imageName)
      : undefined;
    return {
      Flee: monster.Flee ?? 100 + (Level + Agi + Luk / 5),
      Hit: monster.Hit ?? 175 + Level + Dex + Math.floor(Luk / 3),
      ImageUrl,
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

const createImageName = (m: Monster, ext: string) => `${m.Id}${ext}`;

const exists = async (path: string) => {
  try {
    await fs.promises.stat(path);
    return true;
  } catch {
    return false;
  }
};
