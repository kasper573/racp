import { PrismaClient } from "@prisma/client";

export type RACPDatabaseClient = ReturnType<typeof createRACPDatabaseClient>;

export function createRACPDatabaseClient() {
  return new PrismaClient();
}
