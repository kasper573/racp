import * as zod from "zod";
import { t } from "../../trpc";
import { bufferToLuaCode, parseLuaTableAs } from "../../common/parseLuaTableAs";
import { decodeRpcFileData, rpcFile } from "../../common/RpcFile";
import { createUnluac } from "../../../lib/unluac/unluac";
import { gfs } from "../../util/gfs";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { ReducedLuaTables, reducedLuaTables } from "./types";

export type UtilService = ReturnType<typeof createUtilService>;

export function createUtilService() {
  const unluac = createUnluac({
    write: gfs.writeFile,
    read: gfs.readFile,
    remove: gfs.unlink,
  });

  return t.router({
    decompileLuaTableFiles: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .output(reducedLuaTables)
      .mutation(async ({ input: files }) => {
        const compiled = files.map((file) =>
          Buffer.from(decodeRpcFileData(file.data))
        );
        const decompiled = await Promise.all(compiled.map(unluac));
        const luaCodes = decompiled.map(bufferToLuaCode);
        return luaCodes.reduce(
          (reduction: ReducedLuaTables, luaCode) =>
            parseLuaTableAs(luaCode, zod.unknown(), reduction),
          {}
        );
      }),
  });
}
