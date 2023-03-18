import { Divider, Typography } from "@mui/material";
import { routes } from "../router";
import { Auth } from "../components/Auth";
import { RouteList } from "../components/RouteList";
import { UserAccessLevel } from "../../api/services/user/types";
import { defined } from "../../lib/std/defined";
import { trpc } from "../state/client";

export function Menu({ onItemSelected }: { onItemSelected?: () => void }) {
  const { data: settings } = trpc.settings.readPublic.useQuery();
  return (
    <>
      <Typography id="server-menu" sx={{ pl: 2 }}>
        Server
      </Typography>
      <Divider />
      <RouteList
        aria-labelledby="server-menu"
        routes={defined([
          routes.serverInfo.$,
          routes.vendor.$,
          routes.mvp.$,
          settings?.donations.enabled ? routes.donation.$ : undefined,
        ])}
        onClick={onItemSelected}
      />

      <Typography id="database-menu" sx={{ pl: 2 }}>
        Database
      </Typography>
      <Divider />
      <RouteList
        aria-labelledby="database-menu"
        routes={[routes.item.$, routes.monster.$, routes.map.$, routes.skill.$]}
        onClick={onItemSelected}
      />

      <Typography id="tools-menu" sx={{ pl: 2 }}>
        Tools
      </Typography>
      <Divider />
      <RouteList
        aria-labelledby="tools-menu"
        routes={[routes.tools.hunt.$]}
        onClick={onItemSelected}
      />

      <Auth atLeast={UserAccessLevel.Admin}>
        <Typography id="admin-menu" sx={{ pl: 2 }}>
          Admin
        </Typography>
        <Divider />
        <RouteList
          aria-labelledby="admin-menu"
          routes={[
            routes.admin.settings.$,
            routes.admin.assets.$,
            routes.admin.users.$,
            routes.admin.logs.$,
          ]}
          onClick={onItemSelected}
        />
      </Auth>
    </>
  );
}
