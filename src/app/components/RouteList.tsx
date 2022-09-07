import { List, ListItemIcon, ListItemText } from "@mui/material";
import { ComponentProps } from "react";
import { AnyRouteNode } from "../router";
import { LinkListItem } from "./Link";

export function RouteList({
  routes,
  ...props
}: { routes: AnyRouteNode[] } & ComponentProps<typeof List>) {
  return (
    <List role="menu" {...props}>
      {routes.map((route, index) => (
        <LinkListItem to={route()} key={index}>
          <ListItemIcon>{route.options.icon}</ListItemIcon>
          <ListItemText primary={route.options.title} />
        </LinkListItem>
      ))}
    </List>
  );
}
