import { useMemo } from "react";
import { ThemeProvider } from "@mui/material";
import { RouterSwitch } from "react-typesafe-routes";
import { HelmetProvider } from "react-helmet-async";
import { useStore } from "zustand";
import { Layout } from "./layout/Layout";
import { createTheme } from "./fixtures/theme";
import { router } from "./router";
import { themeStore } from "./state/theme";

export function App() {
  const { mode } = useStore(themeStore);
  const theme = useMemo(() => createTheme(mode), [mode]);
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <Layout>
          <RouterSwitch router={router} />
        </Layout>
      </ThemeProvider>
    </HelmetProvider>
  );
}
