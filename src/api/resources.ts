import { ZodType } from "zod";
import { createResourceManager as createResourceManagerImpl } from "../lib/createResourceManager";
import { Logger } from "../lib/logger";
import { YamlRepository, YamlResolver } from "./rathena/YamlDriver";

export type ResourceFactory = ReturnType<
  typeof createResourceManager
>["create"];

export function createResourceManager(options: {
  rAthenaPath: string;
  rAthenaMode: string;
  logger: Logger;
}) {
  return createResourceManagerImpl()
    .add(
      "yaml",
      <ET extends ZodType, Key>(
        file: string,
        resolver: YamlResolver<ET, Key>
      ) => new YamlRepository({ file, resolver, ...options })
    )
    .build();
}
