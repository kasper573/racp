import { trpc } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { ItemIdentifierByFilter } from "../components/ItemIdentifier";

import { dropChanceString } from "../util/formatters";

export const GroupItemGrid = DataGrid.define(trpc.item.groupSearch.useQuery)({
  emptyComponent: () => <>No groups found</>,
  id: (group) => `${group.groupItemId}-${group.itemId}`,
  columns: {
    groupItemId: {
      headerName: "Item",
      renderCell({ value }) {
        return (
          <ItemIdentifierByFilter filter={{ Id: { value, matcher: "=" } }} />
        );
      },
    },
    itemId: {
      headerName: "Item",
      renderCell({ value }) {
        return (
          <ItemIdentifierByFilter filter={{ Id: { value, matcher: "=" } }} />
        );
      },
    },
    chance: {
      renderCell({ value }) {
        return dropChanceString(value * 100);
      },
    },
  },
});
