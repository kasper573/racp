import { MenuItem, Select, useTheme } from "@mui/material";
import { ComponentProps } from "react";
import { ItemDrop } from "../../../api/services/drop/types";
import { MonsterId } from "../../../api/services/monster/types";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { dropChanceString } from "../../grids/ItemDropGrid";

export function DropperSelect({
  value,
  options,
  onChange,
}: {
  value: ItemDrop[];
  options: ItemDrop[];
  onChange: (drops: ItemDrop[]) => void;
}) {
  const selectOptions = (ids: MonsterId[]) =>
    options.filter((drop) => ids.includes(drop.MonsterId));
  return (
    <Select
      size="small"
      multiple
      value={value.map((d) => d.MonsterId)}
      onChange={(e) => {
        const { value } = e.target;
        const ids: number[] =
          typeof value === "string"
            ? value.split(",").map((str) => parseInt(str, 10))
            : value;
        onChange(selectOptions(ids));
      }}
      displayEmpty
      renderValue={(ids) => {
        const selected = selectOptions(ids);
        if (!selected.length) {
          return "Select targets";
        }
        if (selected.length === 1) {
          return <TargetIdentifier drop={selected[0]} sx={{ maxWidth: 125 }} />;
        }
        return `${selected.length} targets selected`;
      }}
    >
      {options.map((drop) => (
        <MenuItem key={drop.MonsterId} value={drop.MonsterId}>
          <TargetIdentifier drop={drop} />
        </MenuItem>
      ))}
    </Select>
  );
}

function TargetIdentifier({
  drop,
  sx,
}: { drop: ItemDrop } & Pick<ComponentProps<typeof MonsterIdentifier>, "sx">) {
  const theme = useTheme();

  return (
    <MonsterIdentifier
      name={drop.MonsterName}
      id={drop.MonsterId}
      imageUrl={drop.MonsterImageUrl}
      sx={{ whiteSpace: "nowrap", ...theme.typography.body2, ...sx }}
    >
      &nbsp;({dropChanceString(drop.Rate)})
    </MonsterIdentifier>
  );
}
