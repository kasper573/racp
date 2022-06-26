import * as React from "react";
import { Divider, Typography } from "@mui/material";
import { router } from "../router";
import { Auth } from "../components/Auth";
import { RouteList } from "../components/RouteList";

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
