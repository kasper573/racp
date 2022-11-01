import * as z from "zod"
import { CompleteHuntedItem, relatedHuntedItemType, CompleteHuntedMonster, relatedHuntedMonsterType } from "./index"

export const huntType = z.object({
  id: z.number().int(),
  accountId: z.number().int(),
  name: z.string(),
  editedAt: z.date(),
  isPublished: z.boolean(),
})

export interface CompleteHunt extends z.infer<typeof huntType> {
  items: CompleteHuntedItem[]
  monsters: CompleteHuntedMonster[]
}

/**
 * relatedHuntType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedHuntType: z.ZodSchema<CompleteHunt> = z.lazy(() => huntType.extend({
  items: relatedHuntedItemType.array(),
  monsters: relatedHuntedMonsterType.array(),
}))
