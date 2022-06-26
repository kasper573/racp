import * as React from "react";
import { AdminPanelSettings } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { MenuItem } from "@mui/material";
import { useAppDispatch } from "../store";
import { auth } from "../state/auth";
import { router } from "../router";
import { MenuOn } from "../components/MenuOn";
import { LinkMenuItem } from "../components/Link";
import { Auth } from "../components/Auth";

export function Toolbar() {
  const dispatch = useAppDispatch();
  return (
    <>
      <MenuOn
        tooltip="Admin"
        trigger={(open) => (
          <Tooltip title="Admin">
            <IconButton onClick={open} sx={{ ml: "auto" }}>
              <AdminPanelSettings />
            </IconButton>
          </Tooltip>
        )}
      >
        <Auth type="protected">
          <MenuItem onClick={() => dispatch(auth.actions.logout())}>
            Sign out
          </MenuItem>
        </Auth>
        <Auth type="anonymous">
          <LinkMenuItem to={router.login()}>Sign in</LinkMenuItem>
        </Auth>
      </MenuOn>
    </>
  );
}
