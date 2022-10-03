import * as lua from "luaparse";
import * as zod from "zod";
import { ZodType } from "zod";
import { MemberExpression } from "luaparse";
import { parseLuaTable } from "../../lib/parseLuaTable";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const legacy = require("legacy-encoding");

export function parseLuaTableAs<ValueType extends ZodType>(
  luaCode: string,
  valueType: ValueType,
  references?: Record<string, unknown>
): Record<string | number, zod.infer<ValueType>> {
  let root = lua.parse(luaCode);

  const rootTable = find(root.body, (st) =>
    st.type === "AssignmentStatement" &&
    st.init[0].type === "TableConstructorExpression"
      ? st.init[0]
      : undefined
  );

  if (!rootTable) {
    throw new Error("Lua script did not contain a table");
  }

  const ref = references
    ? (ref: MemberExpression) => {
        if (Object.hasOwn(references, ref.identifier.name)) {
          return references[ref.identifier.name];
        }
        throw new Error(`Reference not found: ${ref.identifier.name}`);
      }
    : undefined;

  return zod.record(valueType).parse(parseLuaTable(rootTable, ref));
}

function find<T, V>(list: T[], select: (item: T) => V | undefined) {
  for (const item of list) {
    const value = select(item);
    if (value !== undefined) {
      return value;
    }
  }
}

export type LuaParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: unknown };

export function bufferToLuaCode(buffer: Buffer): string {
  // RO lub files are encoded with IBM code page 1252.
  // without this decoding step, resource names will not match the ones in the GRF files.
  return legacy.decode(buffer, "1252");
}
