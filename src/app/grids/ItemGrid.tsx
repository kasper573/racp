import { Stack } from "@mui/material";
import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { ItemDisplayName } from "../util/ItemDisplayName";

export const ItemGrid = DataGrid.define(trpc.item.search.useQuery)({
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
            <Link to={router.item().view({ id: item.Id })}>
              <ItemDisplayName item={item} />
            </Link>
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
