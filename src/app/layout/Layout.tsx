import { ReactNode, Suspense, useState } from "react";
import {
  AppBar,
  Box,
  Drawer as MuiDrawer,
  Toolbar as MuiToolbar,
  Container,
  Divider,
  styled,
  IconButton,
  Stack,
  Fade,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Menu as MenuIcon } from "@mui/icons-material";
import { LoadingPage } from "../pages/LoadingPage";
import { trpc } from "../state/client";
import { globalStyles } from "./globalStyles";
import { Toolbar } from "./Toolbar";
import { Menu } from "./Menu";
import { Logo } from "./Logo";

export function Layout({ children }: { children?: ReactNode }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);
  const { data: settings } = trpc.settings.readPublic.useQuery();

  const drawerWidth = 240;
  const maxContentWidth = "xl" as const;
  const contentBounds = {
    width: { sm: `calc(100% - ${drawerWidth}px)` },
    ml: { sm: `${drawerWidth}px` },
    display: "flex",
    flexDirection: "column",
    flex: 1,
  };

  const sxShowOnSmallDevices = { display: { xs: "block", sm: "none" } };
  const sxShowOnLargeDevices = { display: { xs: "none", sm: "block" } };

  const drawerContent = (
    <>
      <MuiToolbar>
        <Fade in={!!settings?.pageTitle}>
          <div>
            <Logo>{settings?.pageTitle}</Logo>
          </div>
        </Fade>
      </MuiToolbar>
      <Divider />
      <Menu onItemSelected={closeDrawer} />
    </>
  );

  const drawerBoundsStyle = {
    "& .MuiDrawer-paper": {
      boxSizing: "border-box",
      width: drawerWidth,
    },
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
              <Box sx={sxShowOnSmallDevices}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    aria-label="Open main menu"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Fade in={!!settings?.pageTitle}>
                    <div>
                      <Logo icon={false}>{settings?.pageTitle}</Logo>
                    </div>
                  </Fade>
                </Stack>
              </Box>
            </Toolbar>
          </Container>
        </MuiToolbar>
      </AppBar>
      <MuiDrawer
        variant="temporary"
        open={isDrawerOpen}
        onClose={closeDrawer}
        sx={{
          ...drawerBoundsStyle,
          ...sxShowOnSmallDevices,
        }}
      >
        {drawerContent}
      </MuiDrawer>
      <MuiDrawer
        variant="permanent"
        sx={{
          ...drawerBoundsStyle,
          ...sxShowOnLargeDevices,
        }}
      >
        {drawerContent}
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
