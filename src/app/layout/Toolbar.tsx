import * as React from "react";
import { AdminPanelSettings, DarkMode, LightMode } from "@mui/icons-material";
import { Tooltip, IconButton, Box, MenuItem } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store";
import { auth } from "../state/auth";
import { router } from "../router";
import { MenuOn } from "../components/MenuOn";
import { LinkMenuItem } from "../components/Link";
import { Auth } from "../components/Auth";
import { theme } from "../state/theme";

export function Toolbar() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(({ theme }) => theme.mode);
  const inverseMode = mode === "dark" ? "light" : "dark";
  const modeSwitch = modeSwitches[inverseMode];
  return (
    <Box sx={{ ml: "auto", display: "flex" }}>
      <Tooltip title={modeSwitch.title}>
        <IconButton
          onClick={() => dispatch(theme.actions.setMode(inverseMode))}
          sx={{ mr: 1 }}
        >
          {modeSwitch.icon}
        </IconButton>
      </Tooltip>
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
          <MenuItem onClick={() => dispatch(auth.actions.logout())}>
            Sign out
          </MenuItem>
        </Auth>
        <Auth type="anonymous">
          <LinkMenuItem to={router.login()}>Sign in</LinkMenuItem>
        </Auth>
      </MenuOn>
    </Box>
  );
}

const modeSwitches = {
  dark: {
    icon: <DarkMode />,
    title: "Change to dark mode",
  },
  light: {
    icon: <LightMode />,
    title: "Change to light mode",
  },
};
