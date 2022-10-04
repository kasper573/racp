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
  trigger: (controls: {
    open: (e: MouseEvent<T>) => void;
    close: () => void;
    toggle: (e: MouseEvent<T>) => void;
    isOpen: boolean;
  }) => ReactNode;
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
  const isOpen = !!anchor;
  const open = (event: MouseEvent<T>) => setAnchor(event.currentTarget);
  const toggle = (event: MouseEvent<T>) => (isOpen ? close() : open(event));
  const close = () => setAnchor(null);
  return (
    <>
      {trigger({ open, close, toggle, isOpen })}
      <Menu
        {...menuProps}
        anchorEl={anchor}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
        open={Boolean(anchor)}
        MenuListProps={{
          ...menuProps.MenuListProps,
          onClick: concatFunctions(
            menuProps.MenuListProps?.onClick,
            closeOnMenuClicked ? close : undefined
          ),
        }}
        PaperProps={{
          sx: {
            overflow: "visible",
          },
        }}
        onClose={concatFunctions(menuProps.onClose, close)}
      >
        {children}
      </Menu>
    </>
  );
}
