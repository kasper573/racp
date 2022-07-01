import Menu from "@mui/material/Menu";
import { ComponentProps, ReactNode, MouseEvent, useState } from "react";
import { concatFunctions } from "../../lib/concatFunctions";

export interface MenuOnProps<T extends Element>
  extends Omit<ComponentProps<typeof Menu>, "open"> {
  trigger: (openMenu: (e: MouseEvent<T>) => void) => ReactNode;
  closeOnMenuClicked?: boolean;
}

export function MenuOn<T extends Element>({
  trigger,
  children,
  closeOnMenuClicked = true,
  ...menuProps
}: MenuOnProps<T>) {
  const [anchor, setAnchor] = useState<null | T>(null);
  const open = (event: MouseEvent<T>) => setAnchor(event.currentTarget);
  const close = () => setAnchor(null);
  return (
    <>
      {trigger(open)}
      <Menu
        {...menuProps}
        anchorEl={anchor}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
        open={Boolean(anchor)}
        PaperProps={{
          sx: {
            overflow: "visible",
          },
        }}
        onClose={concatFunctions(menuProps.onClose, close)}
      >
        <div onClick={closeOnMenuClicked ? close : undefined}>{children}</div>
      </Menu>
    </>
  );
}
