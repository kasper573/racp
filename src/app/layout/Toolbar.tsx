import { AccountCircle, DarkMode, LightMode } from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store";
import { auth } from "../state/auth";
import { MenuOn } from "../components/MenuOn";
import { theme } from "../state/theme";
import { Auth } from "../components/Auth";
import { UserAccessLevel } from "../../api/services/auth/auth.types";
import { LinkMenuItem } from "../components/Link";
import { router } from "../router";

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
      <MenuOn
        trigger={(open) => (
          <IconButton sx={{ ml: 1 }} onClick={open}>
            <AccountCircle />
          </IconButton>
        )}
      >
        <Auth>
          {(user) => (
            <>
              <ListItem sx={{ pt: 0 }}>
                <ListItemText
                  primaryTypographyProps={{ noWrap: true }}
                  primary={
                    <>
                      Signed in as <strong>{user?.username}</strong>
                    </>
                  }
                />
              </ListItem>
              <Divider sx={{ mb: 1 }} />
              <MenuItem onClick={() => dispatch(auth.actions.logout())}>
                Sign out
              </MenuItem>
            </>
          )}
        </Auth>
        <Auth exact={UserAccessLevel.Guest}>
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
