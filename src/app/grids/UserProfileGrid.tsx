import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { getEnumName } from "../../lib/std/enum";
import { UserAccessLevel } from "../../api/services/user/types";

export const UserProfileGrid = DataGrid.define(trpc.user.search.useQuery)({
  emptyComponent: () => <>No users found</>,
  id: (user) => user.id,
  columns: {
    id: true,
    username: true,
    email: true,
    access: {
      headerName: "Access",
      sortable: false,
      renderCell({ value }) {
        return getEnumName(UserAccessLevel, value);
      },
    },
  },
});
