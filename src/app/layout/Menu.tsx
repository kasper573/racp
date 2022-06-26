import * as React from "react";
import { Divider, List, ListItemIcon, ListItemText } from "@mui/material";
import { Inbox } from "@mui/icons-material";
import { LinkListItem } from "../components/Link";
import { router } from "../router";
import { Auth } from "../components/Auth";

export function Menu() {
  return (
    <>
      <List>
        <LinkListItem to={router.admin().config()}>
          <ListItemIcon>
            <Inbox />
          </ListItemIcon>
          <ListItemText primary="Foo" />
        </LinkListItem>
      </List>
      <Auth type="protected">
        <Divider />
        <List>
          <LinkListItem to={router.admin().config()}>
            <ListItemIcon>
              <Inbox />
            </ListItemIcon>
            <ListItemText primary="Config" />
          </LinkListItem>
        </List>
      </Auth>
    </>
  );
}
