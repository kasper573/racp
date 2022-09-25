import * as zod from "zod";
import { createRpcController } from "../../util/rpc";
import { createUnluac } from "../../../lib/unluac/unluac";
import { bufferToLuaCode, parseLuaTableAs } from "../../common/parseLuaTableAs";
import { gfs } from "../../util/gfs";
import { utilDefinition } from "./definition";
import { ReducedLuaTables } from "./types";

const unluac = createUnluac({
  write: gfs.writeFile,
  read: gfs.readFile,
  remove: gfs.unlink,
});

export function utilController() {
  return createRpcController(utilDefinition.entries, {
    async decompileLuaTableFiles(files) {
      const compiled = files.map((file) =>
        Buffer.from(new Uint8Array(file.data))
      );
      const decompiled = await Promise.all(compiled.map(unluac));
      const luaCodes = decompiled.map(bufferToLuaCode);
      return luaCodes.reduce((reduction: ReducedLuaTables, luaCode) => {
        const res = parseLuaTableAs(luaCode, zod.unknown(), reduction);
        return res.success ? res.data : reduction;
      }, {});
    },
  });
}
