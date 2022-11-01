import * as z from "zod"
import { CompleteHunt, relatedHuntType } from "./index"

export const huntedItemType = z.object({
  id: z.number().int(),
  amount: z.number().int(),
  itemId: z.number().int(),
  targetMonsterIds: z.string(),
  huntId: z.number().int(),
})

export interface CompleteHuntedItem extends z.infer<typeof huntedItemType> {
  hunt: CompleteHunt
}

/**
 * relatedHuntedItemType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedHuntedItemType: z.ZodSchema<CompleteHuntedItem> = z.lazy(() => huntedItemType.extend({
  hunt: relatedHuntType,
}))
