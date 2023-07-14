import {
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { Link as LinkIcon } from "@mui/icons-material";
import { routes } from "../router";
import { Auth } from "../components/Auth";
import { UserAccessLevel } from "../../api/services/user/types";
import { defined } from "../../lib/std/defined";
import { trpc } from "../state/client";
import { LinkListItem } from "../components/Link";
import { AdminPublicSettings } from "../../api/services/settings/types";

export function Menu({ onItemSelected }: { onItemSelected?: () => void }) {
  const { data: settings } = trpc.settings.readPublic.useQuery();
  const sections = useMemo(() => createSections(settings), [settings]);
  return (
    <>
      {sections
        .filter((s) => !s.hidden)
        .map((section, index) => (
          <Auth
            key={`section-` + index}
            atLeast={section.auth ?? UserAccessLevel.Guest}
          >
            <Typography id={section.id} sx={{ pl: 2 }}>
              {section.name}
            </Typography>
            <Divider />
            <List role="menu" aria-labelledby={section.id}>
              {section.routes?.map((route, index) => (
                <LinkListItem
                  key={`route-` + index}
                  to={route({})}
                  onClick={onItemSelected}
                >
                  <ListItemIcon>{route.def.meta.icon}</ListItemIcon>
                  <ListItemText primary={route.def.meta.title} />
                </LinkListItem>
              ))}
              {section.links?.map((link, index) => (
                <LinkListItem
                  href={link.url}
                  key={`link-` + index}
                  target="_blank"
                >
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText primary={link.name} />
                </LinkListItem>
              ))}
            </List>
          </Auth>
        ))}
    </>
  );
}

function createSections(settings?: AdminPublicSettings) {
  const links = Object.entries(settings?.mainMenuLinks ?? {}).map(
    ([name, url]) => ({ name, url })
  );
  return [
    {
      id: "server-menu",
      name: "Server",
      routes: defined([
        routes.serverInfo.$,
        routes.vendor.$,
        settings?.donations.enabled ? routes.donation.$ : undefined,
      ]),
    },
    {
      id: "database-menu",
      name: "Database",
      routes: [routes.item.$, routes.monster.$, routes.map.$, routes.skill.$],
    },
    {
      id: "tools-menu",
      name: "Tools",
      routes: [routes.tools.bossTracker.$, routes.tools.itemTracker.$],
    },
    {
      id: "admin-menu",
      name: "Admin",
      auth: UserAccessLevel.Admin,
      routes: [
        routes.admin.settings.$,
        routes.admin.assets.$,
        routes.admin.users.$,
        routes.admin.logs.$,
      ],
    },
    {
      id: "link-menu",
      name: "Links",
      links,
      hidden: links.length === 0,
    },
  ];
}
