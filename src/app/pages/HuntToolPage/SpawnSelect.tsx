import { MenuItem, Select } from "@mui/material";
import { ComponentProps } from "react";
import {
  MonsterSpawn,
  MonsterSpawnId,
} from "../../../api/services/monster/types";
import { Link } from "../../components/Link";
import { routes } from "../../router";
import { IconWithLabel } from "../../components/IconWithLabel";

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
      value={value ?? null}
      onChange={(e) => onChange(e.target.value as MonsterSpawnId)}
      displayEmpty
      renderValue={(id) => {
        const selected = id !== null ? selectOption(id) : undefined;
        if (!selected) {
          return "Select map";
        }
        return <TargetIdentifier spawn={selected} sx={{ maxWidth: 125 }} />;
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

function TargetIdentifier({
  spawn,
  sx,
}: { spawn: MonsterSpawn } & Pick<ComponentProps<typeof IconWithLabel>, "sx">) {
  return (
    <Link
      to={routes.map.view({
        id: spawn.map,
        pin: { x: spawn.x, y: spawn.y },
      })}
    >
      {spawn.map} ({spawn.amount})
    </Link>
  );
}
