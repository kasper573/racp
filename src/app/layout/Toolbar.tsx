import { AdminPanelSettings, DarkMode, LightMode } from "@mui/icons-material";
import { Tooltip, IconButton, Box, MenuItem } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store";
import { auth } from "../state/auth";
import { MenuOn } from "../components/MenuOn";
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
        >
          {modeSwitch.icon}
        </IconButton>
      </Tooltip>
      <Auth type="protected">
        <MenuOn
          trigger={(open) => (
            <Tooltip title="Admin">
              <IconButton sx={{ ml: 1 }} onClick={open}>
                <AdminPanelSettings />
              </IconButton>
            </Tooltip>
          )}
        >
          <MenuItem onClick={() => dispatch(auth.actions.logout())}>
            Sign out
          </MenuItem>
        </MenuOn>
      </Auth>
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
