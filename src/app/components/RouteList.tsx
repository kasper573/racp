import { List, ListItemIcon, ListItemText } from "@mui/material";
import { ComponentProps } from "react";
import { AnyRouteNode } from "../router";
import { LinkListItem } from "./Link";

export interface RouteListProps extends ComponentProps<typeof List> {
  routes: AnyRouteNode[];
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
        <LinkListItem to={route()} key={index} onClick={onItemSelected}>
          <ListItemIcon>{route.options.icon}</ListItemIcon>
          <ListItemText primary={route.options.title} />
        </LinkListItem>
      ))}
    </List>
  );
}
