import * as path from "path";
import * as zod from "zod";
import { t } from "../../trpc";
import { bufferToLuaCode, parseLuaTableAs } from "../../common/parseLuaTableAs";
import { decodeRpcFileData, rpcFile } from "../../common/RpcFile";
import { createUnluac } from "../../../lib/unluac/unluac";
import { gfs } from "../../gfs";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { ReducedLuaTables, reducedLuaTables } from "./types";

export type UtilService = ReturnType<typeof createUtilService>;

export function createUtilService(binFolder: string) {
  const unluac = createUnluac({
    jarFile: path.resolve(binFolder, "unluac.jar"),
    write: gfs.writeFile,
    read: gfs.readFile,
    remove: gfs.unlink,
  });

  return t.router({
    reduceLuaTableFiles: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .output(reducedLuaTables)
      .mutation(async ({ input: files }) => {
        const possiblyCompiled = files.map((file) =>
          Buffer.from(decodeRpcFileData(file.data))
        );
        const settled = await Promise.allSettled(possiblyCompiled.map(unluac));
        const decompiled = settled.map(
          (result, index) =>
            result.status === "fulfilled"
              ? result.value // Decompile successful
              : possiblyCompiled[index] // Decompile failed, assume original is already decompiled
        );
        const luaCodes = decompiled.map(bufferToLuaCode);
        return luaCodes.reduce(
          (reduction: ReducedLuaTables, luaCode) =>
            parseLuaTableAs(luaCode, zod.unknown(), reduction),
          {}
        );
      }),
  });
}
