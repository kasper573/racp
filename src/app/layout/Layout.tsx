import { ReactNode, Suspense } from "react";
import {
  AppBar,
  Box,
  Drawer as MuiDrawer,
  Toolbar as MuiToolbar,
  Container,
  Divider,
  styled,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { LoadingPage } from "../pages/LoadingPage";
import { globalStyles } from "./globalStyles";
import { Logo } from "./Logo";
import { Toolbar } from "./Toolbar";
import { Menu } from "./Menu";

const title = process.env.appTitle;

export function Layout({ children }: { children?: ReactNode }) {
  const width = 240;
  const maxWidth = "xl" as const;
  const contentBounds = {
    width: `calc(100% - ${width}px)`,
    ml: `${width}px`,
    display: "flex",
    flexDirection: "column",
    flex: 1,
  };
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {globalStyles}
      <AppBar position="fixed" sx={contentBounds}>
        <MuiToolbar disableGutters>
          <Container maxWidth={maxWidth} sx={{ display: "flex" }}>
            <Toolbar />
          </Container>
        </MuiToolbar>
      </AppBar>
      <MuiDrawer
        role="menu"
        variant="permanent"
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width,
          },
        }}
        open
      >
        <MuiToolbar>
          <Logo>{title}</Logo>
        </MuiToolbar>
        <Divider />
        <Menu />
      </MuiDrawer>
      <Box component="main" sx={contentBounds}>
        <MuiToolbar />
        <ContentBounds maxWidth={maxWidth}>
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
