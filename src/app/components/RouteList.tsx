import { List, ListItemIcon, ListItemText } from "@mui/material";
import { ComponentProps } from "react";
import { Route } from "../tsr";
import { LinkListItem } from "./Link";

export interface RouteListProps extends ComponentProps<typeof List> {
  routes: Route[];
  onItemSelected?: () => void;
}

export function RouteList({
  routes,
  onItemSelected,
  ...props
}: RouteListProps) {
  return (
    <List role="menu" {...props}>
      {routes.map((route, index) => (
        <LinkListItem to={route({})} key={index} onClick={onItemSelected}>
          <ListItemIcon>{route.def.meta.icon}</ListItemIcon>
          <ListItemText primary={route.def.meta.title} />
        </LinkListItem>
      ))}
    </List>
  );
}
