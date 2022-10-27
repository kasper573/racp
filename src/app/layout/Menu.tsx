import { Divider, Typography } from "@mui/material";
import { routes } from "../router";
import { Auth } from "../components/Auth";
import { RouteList } from "../components/RouteList";
import { UserAccessLevel } from "../../api/services/user/types";
import { defined } from "../../lib/std/defined";
import { AdminPublicSettings } from "../../api/services/settings/types";
import { trpc } from "../state/client";

const publicRoutes = (settings?: AdminPublicSettings) =>
  defined([
    routes.item.$,
    routes.monster.$,
    routes.map.$,
    routes.skill.$,
    routes.vendor.$,
    routes.mvp.$,
    settings?.donations.enabled ? routes.donation.$ : undefined,
  ]);

const protectedRoutes = [routes.admin.settings.$, routes.admin.assets.$];

export function Menu({ onItemSelected }: { onItemSelected?: () => void }) {
  const { data: settings } = trpc.settings.readPublic.useQuery();
  return (
    <>
      <RouteList
        aria-label="Public menu"
        routes={publicRoutes(settings)}
        onClick={onItemSelected}
      />
      <Auth atLeast={UserAccessLevel.Admin}>
        <Typography id="admin-menu" sx={{ pl: 2 }}>
          Admin
        </Typography>
        <Divider />
        <RouteList
          aria-labelledby="admin-menu"
          routes={protectedRoutes}
          onClick={onItemSelected}
        />
      </Auth>
    </>
  );
}
