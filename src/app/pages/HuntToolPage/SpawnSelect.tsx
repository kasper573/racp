import { Box, MenuItem, Select } from "@mui/material";
import {
  MonsterSpawn,
  MonsterSpawnId,
} from "../../../api/services/monster/types";

export function SpawnSelect({
  value,
  options,
  onChange,
}: {
  value?: MonsterSpawnId;
  options: MonsterSpawn[];
  onChange: (selected?: MonsterSpawnId) => void;
}) {
  const selectOption = (id: MonsterSpawnId) =>
    options.find((spawn) => spawn.id === id);
  return (
    <Select
      size="small"
      multiple={false}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value as MonsterSpawnId)}
      displayEmpty
      renderValue={(id) => {
        const selected = selectOption(id);
        if (!selected) {
          return "Select map";
        }
        return (
          <Box sx={{ maxWidth: 100 }}>
            <TargetIdentifier spawn={selected} />
          </Box>
        );
      }}
    >
      {options.map((spawn) => (
        <MenuItem key={spawn.id} value={spawn.id}>
          <TargetIdentifier spawn={spawn} />
        </MenuItem>
      ))}
    </Select>
  );
}

function TargetIdentifier({ spawn }: { spawn: MonsterSpawn }) {
  return (
    <>
      {spawn.map} ({spawn.amount})
    </>
  );
}
