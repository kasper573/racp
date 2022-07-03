import { LoginEntityType } from "../radb.types";

export const publicUserType = LoginEntityType.pick({
  account_id: true,
  userid: true,
});
