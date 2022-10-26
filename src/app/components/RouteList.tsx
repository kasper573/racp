import { List, ListItemIcon, ListItemText } from "@mui/material";
import { ComponentProps } from "react";
import { RouteResolver } from "../../lib/tsr/Router";
import { LinkListItem } from "./Link";

export interface RouteListProps extends ComponentProps<typeof List> {
  routes: RouteResolver[];
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
          <ListItemIcon>{route.meta.icon}</ListItemIcon>
          <ListItemText primary={route.meta.title} />
        </LinkListItem>
      ))}
    </List>
  );
}
