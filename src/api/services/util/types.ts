import * as zod from "zod";

export type ReducedLuaTables = zod.infer<typeof reducedLuaTables>;

export const reducedLuaTables = zod.record(zod.unknown());
