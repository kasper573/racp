import { Divider, Typography } from "@mui/material";
import { router } from "../router";
import { Auth } from "../components/Auth";
import { RouteList } from "../components/RouteList";
import { UserAccessLevel } from "../../api/services/auth/types";

const publicRoutes = [router.item, router.monster];
const protectedRoutes = [router.admin().config];

export function Menu() {
  return (
    <>
      <RouteList routes={publicRoutes} />
      <Auth atLeast={UserAccessLevel.Admin}>
        <Typography sx={{ pl: 2 }}>Admin</Typography>
        <Divider />
        <RouteList routes={protectedRoutes} />
      </Auth>
    </>
  );
}
