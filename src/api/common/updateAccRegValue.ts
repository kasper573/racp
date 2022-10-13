import { DatabaseDriver } from "../rathena/DatabaseDriver";
import { Tables } from "../rathena/DatabaseDriver.types";

/**
 * Abstraction for updating an entry in any of the rathena "acc_reg_" tables
 */
export async function updateAccRegValue<T extends AccRegType, Value>(
  db: DatabaseDriver,
  type: T,
  accountId: number,
  key: string,
  createValue: (currentValue?: AccRegValue<T>) => AccRegValue<T>
) {
  async function updateUsingProvider<Provider extends AccRegProvider>({
    tableName,
    formatValue,
    parseValue,
  }: Provider) {
    try {
      const baseQuery = db.char.table(tableName);
      const baseEntry = { account_id: accountId, key };

      const existing = await baseQuery
        .clone()
        .where(baseEntry)
        .clone()
        .select("value")
        .first();

      let success: boolean;
      if (existing) {
        const currentValue = existing ? parseValue(existing.value) : undefined;
        const updatedValue = createValue(currentValue);
        const affectedRows = await baseQuery
          .clone()
          .where(baseEntry)
          .update({ value: formatValue(updatedValue) });
        success = affectedRows > 0;
      } else {
        const newIds = await baseQuery
          .clone()
          .insert({ ...baseEntry, value: formatValue(createValue()) });
        success = newIds.length > 0;
      }
      return success;
    } catch (e) {
      return false;
    }
  }

  return updateUsingProvider(accRegProviders[type]);
}

export type AccRegType = keyof AccRegProviders;

export type AccRegValue<T extends AccRegType> =
  AccRegProviders[T] extends AccRegProvider<any, infer V> ? V : never;

export type AccRegProviders = typeof accRegProviders;

export type AccRegProvider<
  TableName extends keyof Tables = keyof Tables,
  Value = any
> = {
  tableName: TableName;
  parseValue: (value: string) => Value;
  formatValue: (value: Value) => string;
};

const accRegProviders = {
  num: {
    tableName: "acc_reg_num" as const,
    parseValue: parseFloat,
    formatValue: String,
  },
  str: {
    tableName: "acc_reg_str" as const,
    parseValue: String,
    formatValue: String,
  },
};
