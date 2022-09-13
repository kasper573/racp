import * as zod from "zod";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { unluac } from "../../../lib/unluac/unluac";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { utilDefinition } from "./definition";
import { ReducedLuaTables } from "./types";

export function utilController() {
  return createRpcController(utilDefinition.entries, {
    async decompileLuaTableFiles(files) {
      const compiled = files.map((file) =>
        Buffer.from(new Uint8Array(file.data))
      );
      const decompiled = await Promise.all(compiled.map(unluac));
      const luaCodes = decompiled.map((buffer) => buffer.toString("utf8"));
      return luaCodes.reduce((reduction: ReducedLuaTables, luaCode) => {
        const res = parseLuaTableAs(luaCode, zod.unknown(), reduction);
        return res.success ? res.data : reduction;
      }, {});
    },
  });
}
