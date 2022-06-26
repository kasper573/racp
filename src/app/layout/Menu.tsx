import * as React from "react";
import {
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { LinkListItem } from "../components/Link";
import { AnyRouteNode, router } from "../router";
import { Auth } from "../components/Auth";

const publicRoutes = [router.item, router.monster];
const protectedRoutes = [router.admin().config];

export function Menu() {
  return (
    <>
      <RouteList routes={publicRoutes} />
      <Auth type="protected">
        <Typography sx={{ pl: 2 }}>Admin</Typography>
        <Divider />
        <RouteList routes={protectedRoutes} />
      </Auth>
    </>
  );
}

function RouteList({ routes }: { routes: AnyRouteNode[] }) {
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
