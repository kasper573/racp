import * as lua from "luaparse";
import * as zod from "zod";
import { ItemInfo, itemInfoType } from "../types";
import { parseLuaTable } from "../../../../lib/parseLuaTable";
import { ParseResult } from "../../../../lib/createFileStore";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const legacy = require("legacy-encoding");

export function parseItemInfo(
  luaCode: string
): ParseResult<Record<string, ItemInfo>> {
  let root: lua.Chunk;
  try {
    // itemInfo.lub is encoded with IBM code page 949.
    // without this decoding step, korean symbols will not be presented properly.
    const luaCodeUTF8 = legacy.decode(Buffer.from(luaCode, "utf-8"), "949");
    root = lua.parse(luaCodeUTF8);
  } catch {
    return { success: false };
  }

  const rootTable = find(root.body, (st) =>
    st.type === "AssignmentStatement" &&
    st.init[0].type === "TableConstructorExpression"
      ? st.init[0]
      : undefined
  );

  if (!rootTable) {
    return { success: false };
  }

  const tableData = parseLuaTable(rootTable);
  return zod.record(zod.string(), itemInfoType).safeParse(tableData);
}

function find<T, V>(list: T[], select: (item: T) => V | undefined) {
  for (const item of list) {
    const value = select(item);
    if (value !== undefined) {
      return value;
    }
  }
}
