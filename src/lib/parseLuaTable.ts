import {
  Expression,
  MemberExpression,
  TableConstructorExpression,
} from "luaparse";
import { trimQuotes } from "./trimQuotes";

export function parseLuaTable(
  table: TableConstructorExpression,
  ref: (exp: MemberExpression) => unknown = () => {
    throw new Error("References not supported");
  }
) {
  const firstField = table.fields[0];
  if (!firstField) {
    return {};
  }

  if (firstField.type === "TableValue") {
    const list: unknown[] = [];
    for (const field of table.fields) {
      if (field.type !== "TableValue") {
        // Lists may only contain single values
        continue;
      }
      list.push(resolve(field.value, ref));
    }
    return list;
  }

  const record: Record<string, unknown> = {};
  for (const field of table.fields) {
    switch (field.type) {
      case "TableKey": {
        const key = `${resolve(field.key, ref)}`;
        record[key] = resolve(field.value, ref);
        break;
      }
      case "TableKeyString":
        record[field.key.name] = resolve(field.value, ref);
        break;
      case "TableValue":
        // Ignore single table values in records.
        break;
    }
  }
  return record;
}

function resolve(exp: Expression, ref: (exp: MemberExpression) => unknown) {
  switch (exp.type) {
    case "Identifier":
      return exp.name;
    case "NumericLiteral":
      return exp.value;
    case "StringLiteral":
      return trimQuotes((exp.value as string | null) ?? exp.raw ?? "");
    case "BooleanLiteral":
      return exp.value;
    case "TableConstructorExpression":
      return parseLuaTable(exp, ref);
    case "MemberExpression":
      return ref(exp);
  }
  throw new Error(`Cannot resolve ${exp.type}`);
}
