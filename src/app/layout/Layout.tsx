import { CSSProperties, ReactNode, Suspense, useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Drawer as MuiDrawer,
  Fade,
  IconButton,
  Stack,
  styled,
  Toolbar as MuiToolbar,
  useTheme,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Menu as MenuIcon } from "@mui/icons-material";
import { LoadingPage } from "../pages/LoadingPage";
import { trpc } from "../state/client";
import { useReadyMediaQuery } from "../../lib/hooks/useReadyMediaQuery";
import { globalStyles } from "./globalStyles";
import { Toolbar } from "./Toolbar";
import { Menu } from "./Menu";
import { Logo } from "./Logo";

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
  const maxContentWidth = "xl" as const;
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
          <Container maxWidth={maxContentWidth} sx={{ display: "flex" }}>
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
        <MuiToolbar />
        <ContentBounds maxWidth={maxContentWidth}>
          <ContentSurface>
            <Suspense fallback={<LoadingPage />}>{children}</Suspense>
          </ContentSurface>
        </ContentBounds>
      </Box>
    </>
  );
}

// The purpose of the bounds/surface separation is to provide a relative element for content to dock into,
// while still relying on the MUI Container to set the bounds (Having margin + bounds on the same element wouldn't work).

const ContentBounds = styled(Container)`
  display: flex;
  flex: 1;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const ContentSurface = styled("div")`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;
