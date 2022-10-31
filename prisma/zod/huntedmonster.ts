import * as z from "zod"
import { CompleteHunt, relatedHuntType } from "./index"

export const huntedMonsterType = z.object({
  id: z.number().int(),
  monsterId: z.number().int(),
  spawnId: z.string().nullish(),
  killsPerUnit: z.number().int(),
  huntId: z.number().int(),
})

export interface CompleteHuntedMonster extends z.infer<typeof huntedMonsterType> {
  hunt: CompleteHunt
}

/**
 * relatedHuntedMonsterType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedHuntedMonsterType: z.ZodSchema<CompleteHuntedMonster> = z.lazy(() => huntedMonsterType.extend({
  hunt: relatedHuntType,
}))
