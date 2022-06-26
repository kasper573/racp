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
import { auth } from "../slices/auth";
import { router } from "../router";
import { MenuOn } from "../components/MenuOn";
import { LinkButton, LinkMenuItem } from "../components/Link";
import { Auth } from "../components/Auth";
import { Title } from "./Title";

export function AppBar() {
  const dispatch = useAppDispatch();
  return (
    <MuiAppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Title />
          <Box sx={{ display: "flex", flexGrow: 1, color: "white" }}>
            <LinkButton to={router.home()}>Home</LinkButton>
          </Box>
          <MenuOn
            tooltip="Admin"
            trigger={(open) => (
              <Tooltip title="Admin">
                <IconButton onClick={open}>
                  <AdminPanelSettings />
                </IconButton>
              </Tooltip>
            )}
          >
            <Auth type="protected">
              <LinkMenuItem to={router.admin().config()}>Config</LinkMenuItem>
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
