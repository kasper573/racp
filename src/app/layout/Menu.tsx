import { Divider, Typography } from "@mui/material";
import { router } from "../router";
import { Auth } from "../components/Auth";
import { RouteList } from "../components/RouteList";
import { UserAccessLevel } from "../../api/services/user/types";

const publicRoutes = [router.item, router.monster, router.map];
const protectedRoutes = Object.values(router.admin.children);

export function Menu() {
  return (
    <>
      <RouteList aria-label="Main menu" routes={publicRoutes} />
      <Auth atLeast={UserAccessLevel.Admin}>
        <Typography id="admin-menu" sx={{ pl: 2 }}>
          Admin
        </Typography>
        <Divider />
        <RouteList aria-labelledby="admin-menu" routes={protectedRoutes} />
      </Auth>
    </>
  );
}
