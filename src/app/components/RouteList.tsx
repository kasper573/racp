import { List, ListItemIcon, ListItemText } from "@mui/material";
import { AnyRouteNode } from "../router";
import { LinkListItem } from "./Link";

export function RouteList({ routes }: { routes: AnyRouteNode[] }) {
  return (
    <List>
      {routes.map((route, index) => (
        <LinkListItem to={route()} key={index}>
          <ListItemIcon>{route.options.icon}</ListItemIcon>
          <ListItemText primary={route.options.title} />
        </LinkListItem>
      ))}
    </List>
  );
}
