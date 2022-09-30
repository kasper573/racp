import { memo } from "react";
import { useHistory } from "react-router";
import { WarpId } from "../../../api/services/map/types";
import { MonsterSpawnId } from "../../../api/services/monster/types";
import { useRouteParams } from "../../../lib/hooks/useRouteParams";
import { router } from "../../router";
import { TabSwitch } from "../../components/TabSwitch";
import { WarpGrid } from "../../grids/WarpGrid";
import { MonsterSpawnGrid } from "../../grids/MonsterSpawnGrid";

export const MapTabs = memo(
  ({
    setHighlightWarpId,
    setHighlightSpawnId,
  }: {
    setHighlightWarpId: (warpId?: WarpId) => void;
    setHighlightSpawnId: (spawnId?: MonsterSpawnId) => void;
  }) => {
    const history = useHistory();
    const { id, x, y, tab } = useRouteParams(router.map().view);
    return (
      <TabSwitch
        activeTabId={tab ?? "warps"}
        onChange={(e, newTab) =>
          history.replace(router.map().view({ id, tab: newTab, x, y }).$)
        }
        tabs={[
          {
            id: "warps",
            label: "Warps",
            content: (
              <WarpGrid
                filter={{ fromMap: { value: id, matcher: "equals" } }}
                onHoveredEntityChange={(entity) =>
                  setHighlightWarpId(entity?.npcEntityId)
                }
              />
            ),
          },
          {
            id: "monsters",
            label: "Monsters",
            content: (
              <MonsterSpawnGrid
                filter={{ map: { value: id, matcher: "equals" } }}
                gridProps={{ columnVisibilityModel: { map: false } }}
                onHoveredEntityChange={(entity) =>
                  setHighlightSpawnId(entity?.npcEntityId)
                }
              />
            ),
          },
        ]}
      />
    );
  }
);
