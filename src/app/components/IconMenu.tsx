import Menu from "@mui/material/Menu";
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { ComponentProps, ReactNode } from "react";
import { concatFunctions } from "../../lib/concatFunctions";

export interface MenuOnProps<T extends Element>
  extends Omit<ComponentProps<typeof Menu>, "children" | "open"> {
  tooltip: string;
  items: MenuItemProps[];
  children: (openMenu: (e: React.MouseEvent<T>) => void) => ReactNode;
}

export function MenuOn<T extends Element>({
  tooltip,
  items,
  children,
  ...menuProps
}: MenuOnProps<T>) {
  const [anchor, setAnchor] = React.useState<null | T>(null);
  const open = (event: React.MouseEvent<T>) => setAnchor(event.currentTarget);
  const close = () => setAnchor(null);
  return (
    <>
      {children(open)}
      <Menu
        {...menuProps}
        anchorEl={anchor}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
        open={Boolean(anchor)}
        onClose={concatFunctions(menuProps.onClose, close)}
      >
        {items.map(({ children, onClick, ...props }, index) => (
          <MenuItem
            key={index}
            onClick={concatFunctions(onClick, close)}
            {...props}
          >
            <Typography textAlign="center">{children}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
