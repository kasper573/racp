import { Stack } from "@mui/material";
import { DataGrid } from "../components/DataGrid";
import { Item, ItemFilter } from "../../api/services/item/types";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";
import { ImageWithFallback } from "../components/ImageWithFallback";

export const ItemGrid = DataGrid.define<Item, ItemFilter, Item["Id"]>({
  query: trpc.item.search.useQuery,
  id: (item) => item.Id,
  columns: {
    Name: {
      renderCell({ row: item }) {
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <ImageWithFallback
              src={item.ImageUrl}
              alt={item.Name}
              sx={{ width: 32 }}
            />
            <Link to={router.item().view({ id: item.Id })}>{item.Name}</Link>
          </Stack>
        );
      },
    },
    Buy: "Buy",
    Sell: "Sell",
    Weight: "Weight",
    Attack: "Atk",
    MagicAttack: "MAtk",
    Defense: "Def",
    EquipLevelMin: "Min Level",
    EquipLevelMax: "Max Level",
    Slots: "Slots",
  },
});
