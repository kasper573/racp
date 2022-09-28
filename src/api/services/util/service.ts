import * as zod from "zod";
import { t } from "../t";
import { bufferToLuaCode, parseLuaTableAs } from "../../common/parseLuaTableAs";
import { rpcFile } from "../../../lib/rpc/RpcFile";
import { createUnluac } from "../../../lib/unluac/unluac";
import { gfs } from "../../util/gfs";
import { ReducedLuaTables, reducedLuaTables } from "./types";

export const util = t.router({
  decompileLuaTableFiles: t.procedure
    .input(zod.array(rpcFile))
    .output(reducedLuaTables)
    .mutation(async ({ input: files }) => {
      const compiled = files.map((file) =>
        Buffer.from(new Uint8Array(file.data))
      );
      const decompiled = await Promise.all(compiled.map(unluac));
      const luaCodes = decompiled.map(bufferToLuaCode);
      return luaCodes.reduce((reduction: ReducedLuaTables, luaCode) => {
        const res = parseLuaTableAs(luaCode, zod.unknown(), reduction);
        return res.success ? res.data : reduction;
      }, {});
    }),
});

const unluac = createUnluac({
  write: gfs.writeFile,
  read: gfs.readFile,
  remove: gfs.unlink,
});
