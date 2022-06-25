import { List, ListItemButton } from "@mui/material";

export function ConfigList({
  configs,
  onSelect,
}: {
  configs: string[];
  onSelect: (config: string) => void;
}) {
  return (
    <List>
      {configs.map((item, index) => (
        <ListItemButton key={index} onClick={() => onSelect(item)}>
          {item}
        </ListItemButton>
      ))}
    </List>
  );
}
