import * as React from "react";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { AdminPanelSettings } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { MenuItem } from "@mui/material";
import { useAppDispatch } from "../store";
import { auth } from "../state/auth";
import { router } from "../router";
import { MenuOn } from "../components/MenuOn";
import { LinkButton, LinkMenuItem } from "../components/Link";
import { Auth } from "../components/Auth";
import { Logo } from "./Logo";

export function AppBar() {
  const dispatch = useAppDispatch();
  return (
    <MuiAppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Logo to={router.home()}>{process.env.app_title}</Logo>

          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <LinkButton to={router.admin().config()}>Foo</LinkButton>
          </Box>

          <Box sx={{ display: "flex" }}>
            <Auth type="protected">
              <LinkButton to={router.admin().config()}>Config</LinkButton>
            </Auth>
          </Box>

          <MenuOn
            tooltip="Admin"
            trigger={(open) => (
              <Tooltip title="Admin">
                <IconButton onClick={open} sx={{ ml: 2 }}>
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
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
}
