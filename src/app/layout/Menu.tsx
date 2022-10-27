import { Divider, Typography } from "@mui/material";
import { router } from "../router";
import { Auth } from "../components/Auth";
import { RouteList } from "../components/RouteList";
import { UserAccessLevel } from "../../api/services/user/types";
import { defined } from "../../lib/std/defined";
import { AdminPublicSettings } from "../../api/services/settings/types";
import { trpc } from "../state/client";

const publicRoutes = (settings?: AdminPublicSettings) =>
  defined([
    router.item.$,
    router.monster.$,
    router.map.$,
    router.skill.$,
    router.vendor.$,
    router.mvp.$,
    settings?.donations.enabled ? router.donation.$ : undefined,
  ]);

const protectedRoutes = [router.admin.settings.$, router.admin.assets.$];

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
