import { Knex } from "knex";
import { ZodType } from "zod";
import * as zod from "zod";

export type RACPDatabase = ReturnType<typeof createRACPDatabase>;

export function createRACPDatabase(knex: Knex) {
  function createQueryFor<ET extends ZodType>(
    tableName: string,
    tableEntityType: ET
  ) {
    type Entity = zod.infer<ET>;
    return knex<Entity, Entity[]>(tableName);
  }

  return createQueryFor;
}
