import { AccountCircle, DarkMode, LightMode } from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import { useStore } from "zustand";
import { ReactNode } from "react";
import { useLogout } from "../state/auth";
import { MenuOn } from "../components/MenuOn";
import { themeStore } from "../state/theme";
import { Auth } from "../components/Auth";
import { UserAccessLevel } from "../../api/services/user/types";
import { LinkMenuItem } from "../components/Link";
import { router } from "../router";
import { OnlineBadge } from "../components/OnlineBadge";
import { trpc } from "../state/client";

export function Toolbar({ children }: { children?: ReactNode }) {
  const logout = useLogout();
  const { mode, setMode } = useStore(themeStore);
  const { data: profile } = trpc.user.getMyProfile.useQuery();
  const inverseMode = mode === "dark" ? "light" : "dark";
  const modeSwitch = modeSwitches[inverseMode];
  return (
    <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
      <Box>{children}</Box>
      <Box sx={{ ml: "auto" }}>
        <Tooltip title={modeSwitch.title}>
          <IconButton onClick={() => setMode(inverseMode)}>
            {modeSwitch.icon}
          </IconButton>
        </Tooltip>
        <MenuOn
          contentProps={{
            "data-testid": "user menu",
          }}
          trigger={(open) => (
            <IconButton
              aria-label="Open user menu"
              sx={{ ml: 1 }}
              onClick={open}
            >
              {profile ? (
                <OnlineBadge>
                  <AccountCircle />
                </OnlineBadge>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          )}
        >
          <Auth>
            <ListItem sx={{ pt: 0 }}>
              <ListItemText
                primaryTypographyProps={{ noWrap: true }}
                primary={
                  <>
                    Signed in as <strong>{profile?.username}</strong>
                  </>
                }
              />
            </ListItem>
            <Divider sx={{ mb: 1 }} />
            <LinkMenuItem to={router.user().settings()}>Settings</LinkMenuItem>
            <MenuItem onClick={logout}>Sign out</MenuItem>
          </Auth>
          <Auth exact={UserAccessLevel.Guest}>
            <LinkMenuItem to={router.user().login({})}>Sign in</LinkMenuItem>
            <LinkMenuItem to={router.user().register()}>Register</LinkMenuItem>
          </Auth>
        </MenuOn>
      </Box>
    </Stack>
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
