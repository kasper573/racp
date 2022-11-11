import { CSSProperties, ReactNode, Suspense, useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Drawer as MuiDrawer,
  Fade,
  IconButton,
  Stack,
  Toolbar as MuiToolbar,
  useTheme,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { trpc } from "../state/client";
import { useReadyMediaQuery } from "../../lib/hooks/useReadyMediaQuery";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { globalStyles } from "./globalStyles";
import { Toolbar } from "./Toolbar";
import { Menu } from "./Menu";
import { Logo } from "./Logo";
import { pageMaxWidth } from "./Page";

export function Layout({ children }: { children?: ReactNode }) {
  const theme = useTheme();
  const isDrawerPermanent = useReadyMediaQuery(theme.breakpoints.up("md"));
  const [isDrawerOpen, setDrawerOpen] = useState(isDrawerPermanent === true);
  const { data: settings } = trpc.settings.readPublic.useQuery();

  useEffect(() => {
    if (isDrawerPermanent !== undefined) {
      setDrawerOpen(isDrawerPermanent);
    }
  }, [isDrawerPermanent]);

  function handleDrawerCloseRequest() {
    if (!isDrawerPermanent) {
      setDrawerOpen(false);
    }
  }

  const drawerWidth = 240;
  const contentBounds: CSSProperties = {
    width: isDrawerPermanent ? `calc(100% - ${drawerWidth}px)` : undefined,
    marginLeft: isDrawerPermanent ? `${drawerWidth}px` : undefined,
    display: "flex",
    flexDirection: "column",
    flex: 1,
  };

  return (
    <>
      <Helmet>
        <title>{settings?.pageTitle}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Helmet>
      {globalStyles}
      <AppBar position="fixed" sx={contentBounds}>
        <MuiToolbar disableGutters>
          <Container maxWidth={pageMaxWidth} sx={{ display: "flex" }}>
            <Toolbar>
              {!isDrawerPermanent && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    aria-label="Open main menu"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Fade in={!!settings?.pageTitle}>
                    <div>
                      <Logo>{settings?.pageTitle}</Logo>
                    </div>
                  </Fade>
                </Stack>
              )}
            </Toolbar>
          </Container>
        </MuiToolbar>
      </AppBar>
      <MuiDrawer
        aria-label="Main menu"
        variant={isDrawerPermanent ? "permanent" : "temporary"}
        open={isDrawerOpen}
        onClose={handleDrawerCloseRequest}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        <MuiToolbar sx={{ "&": { padding: 0 } }}>
          <Fade in={!!settings?.pageTitle}>
            <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
              <Logo>{settings?.pageTitle}</Logo>
            </Box>
          </Fade>
        </MuiToolbar>
        <Menu onItemSelected={handleDrawerCloseRequest} />
      </MuiDrawer>
      <Box component="main" sx={contentBounds}>
        <Suspense
          fallback={
            <MuiToolbar>
              <GlobalLoadingIndicator isLoading />
            </MuiToolbar>
          }
        >
          <MuiToolbar>
            <GlobalLoadingIndicator />
          </MuiToolbar>
          {children}
        </Suspense>
      </Box>
    </>
  );
}

// The purpose of the bounds/surface separation is to provide a relative element for content to dock into,
// while still relying on the MUI Container to set the bounds (Having margin + bounds on the same element wouldn't work).

function GlobalLoadingIndicator({
  isLoading: inputLoadingState,
}: {
  isLoading?: boolean;
}) {
  const fetchCount = useIsFetching();
  const mutationCount = useIsMutating();
  const isLoading = inputLoadingState ?? (fetchCount > 0 || mutationCount > 0);
  if (!isLoading) {
    return null;
  }
  return (
    <LoadingIndicator
      variant="linear"
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        transform: "translateY(100%)",
      }}
    />
  );
}
