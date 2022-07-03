import * as zod from "zod";

export const publicUserType = zod.object({
  account_id: zod.number().optional(),
  userid: zod.string().optional(),
});
