import Menu from "@mui/material/Menu";
import {
  ComponentProps,
  ReactNode,
  MouseEvent,
  useState,
  HTMLAttributes,
} from "react";
import { concatFunctions } from "../../lib/std/concatFunctions";

export interface MenuOnProps<T extends Element>
  extends Omit<ComponentProps<typeof Menu>, "open"> {
  trigger: (openMenu: (e: MouseEvent<T>) => void) => ReactNode;
  closeOnMenuClicked?: boolean;
  contentProps?: HTMLAttributes<HTMLDivElement> & { "data-testid"?: string };
}

export function MenuOn<T extends Element>({
  trigger,
  children,
  closeOnMenuClicked = true,
  contentProps,
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
        <div {...contentProps} onClick={closeOnMenuClicked ? close : undefined}>
          {children}
        </div>
      </Menu>
    </>
  );
}
