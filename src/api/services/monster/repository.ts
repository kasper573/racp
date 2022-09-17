import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { autoMapLinkerUrls, Linker } from "../../../lib/createPublicFileLinker";
import { createImageUpdater } from "../../common/createImageUpdater";
import { Monster, monsterSpawnType } from "./types";
import { createMonsterResolver } from "./util/createMonsterResolver";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  rAthenaMode,
  linker,
  formatter,
  yaml,
  npc,
}: {
  linker: Linker;
  formatter: ImageFormatter;
  rAthenaMode: RAthenaMode;
  yaml: YamlDriver;
  npc: NpcDriver;
}) {
  const imageLinker = linker.chain("monsters");
  const imageName = (m: Monster) => `${m.Id}${formatter.fileExtension}`;
  const [imageUrlsPromise, imageWatcher] = autoMapLinkerUrls(imageLinker);

  const monsterResolver = createMonsterResolver(rAthenaMode);
  const spawnsPromise = npc.resolve("scripts_monsters.conf", monsterSpawnType);
  const monstersPromise = yaml.resolve("db/mob_db.yml", monsterResolver);

  async function getMonsters() {
    const monsters = await monstersPromise;
    const imageUrls = await imageUrlsPromise;
    return Array.from(monsters.values()).reduce(
      (monsters, monster) =>
        monsters.set(monster.Id, {
          ...monster,
          ImageUrl: imageUrls.get(imageName(monster)),
        }),
      new Map<Monster["Id"], Monster>()
    );
  }

  return {
    getSpawns: () => spawnsPromise,
    getMonsters,
    updateImages: createImageUpdater(formatter, imageLinker),
    missingImages: () =>
      monstersPromise.then((map) =>
        Array.from(map.values()).filter(
          (monster) => monster.ImageUrl === undefined
        )
      ),
    destroy: () => imageWatcher.close(),
  };
}
