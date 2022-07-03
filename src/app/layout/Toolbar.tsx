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
import { useAppDispatch, useAppSelector } from "../state/store";
import { logout } from "../slices/auth";
import { MenuOn } from "../components/MenuOn";
import { theme } from "../slices/theme";
import { Auth } from "../components/Auth";
import { UserAccessLevel } from "../../api/services/auth/types";
import { LinkMenuItem } from "../components/Link";
import { router } from "../router";
import { OnlineBadge } from "../components/OnlineBadge";

export function Toolbar() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(({ theme }) => theme.mode);
  const username = useAppSelector(({ auth }) => auth.user?.username);
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
            <OnlineBadge visible={!!username}>
              <AccountCircle />
            </OnlineBadge>
          </IconButton>
        )}
      >
        <Auth>
          <ListItem sx={{ pt: 0 }}>
            <ListItemText
              primaryTypographyProps={{ noWrap: true }}
              primary={
                <>
                  Signed in as <strong>{username}</strong>
                </>
              }
            />
          </ListItem>
          <Divider sx={{ mb: 1 }} />
          <MenuItem onClick={() => dispatch(logout())}>Sign out</MenuItem>
        </Auth>
        <Auth exact={UserAccessLevel.Guest}>
          <LinkMenuItem to={router.login({})}>Sign in</LinkMenuItem>
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
