import { t } from "../../trpc";
import { ExpRepository } from "./repository";
import { expConfigType } from "./types";

export type ExpService = ReturnType<typeof createExpService>;

export function createExpService(repo: ExpRepository) {
  return t.router({
    config: t.procedure.output(expConfigType).query(() => repo.then()),
  });
}
