import { Expression, TableConstructorExpression } from "luaparse";

export function parseLuaTable(table: TableConstructorExpression) {
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
      list.push(resolve(field.value));
    }
    return list;
  }

  const record: Record<string, unknown> = {};
  for (const field of table.fields) {
    switch (field.type) {
      case "TableKey": {
        const key = trimQuotes(`${resolve(field.key)}`);
        record[key] = resolve(field.value);
        break;
      }
      case "TableKeyString":
        record[field.key.name] = resolve(field.value);
        break;
      case "TableValue":
        // Ignore single table values in records.
        break;
    }
  }
  return record;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const trimQuotes = (str: string) => /^"?(.*?)"?$/.exec(str)![1];

function resolve(exp: Expression) {
  switch (exp.type) {
    case "Identifier":
      return exp.name;
    case "NumericLiteral":
      return exp.value;
    case "StringLiteral":
      return (exp.value as string | null) ?? exp.raw ?? "";
    case "BooleanLiteral":
      return exp.value;
    case "TableConstructorExpression":
      return parseLuaTable(exp);
  }
  return new Error(`Cannot resolve ${exp.type}`);
}
