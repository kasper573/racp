import { MenuItem, Select } from "@mui/material";
import { ComponentProps } from "react";
import {
  MonsterSpawn,
  MonsterSpawnId,
} from "../../../../api/services/monster/types";

export function SpawnSelect({
  value,
  options,
  onChange,
  sx,
}: {
  value?: MonsterSpawnId;
  options: MonsterSpawn[];
  onChange: (selected?: MonsterSpawnId) => void;
} & Pick<ComponentProps<typeof Select>, "sx">) {
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
        return <SpawnIdentifier spawn={selected} />;
      }}
      sx={sx}
    >
      {options.map((spawn) => (
        <MenuItem key={spawn.id} value={spawn.id}>
          <SpawnIdentifier spawn={spawn} />
        </MenuItem>
      ))}
    </Select>
  );
}

export function SpawnIdentifier({ spawn }: { spawn: MonsterSpawn }) {
  return (
    <>
      {spawn.map} ({spawn.amount})
    </>
  );
}
