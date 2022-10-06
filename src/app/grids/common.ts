import { durationString } from "../../lib/std/durationString";

export const monsterSpawnTimeColumns = {
  spawnDelay: {
    headerName: "Spawn time",
    renderCell: renderDurationCell,
  },
  spawnWindow: {
    headerName: "Spawn window",
    renderCell: renderDurationCell,
  },
};

export function renderDurationCell({ value }: { value?: number }) {
  return value !== undefined && value > 0
    ? durationString(value, 2)
    : undefined;
}
