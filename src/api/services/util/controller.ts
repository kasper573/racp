import * as zod from "zod";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { unluac } from "../../../lib/unluac/unluac";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { utilDefinition } from "./definition";

export function utilController() {
  return createRpcController(utilDefinition.entries, {
    async decompileLuaTableFiles(files) {
      const tablePromises = files.map(async (file) => {
        const compiledLuaCode = Buffer.from(new Uint8Array(file.data));
        const luaCode = (await unluac(compiledLuaCode)).toString("utf8");
        const res = parseLuaTableAs(luaCode, zod.string());
        return res.success ? res.data : {};
      });

      const tables = await Promise.all(tablePromises);
      return tables.reduce((acc, table) => ({ ...acc, ...table }), {});
    },
  });
}
