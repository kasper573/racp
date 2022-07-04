import * as lua from "luaparse";
import * as zod from "zod";
import { parseLuaTable } from "../../../../lib/parseLuaTable";
import { ItemInfo, itemInfoType } from "../types";
import { ParseResult } from "../../../../lib/createFileStore";

export function parseItemInfo(
  luaCode: string
): ParseResult<Record<string, ItemInfo>> {
  let root: lua.Chunk;
  try {
    root = lua.parse(luaCode);
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
