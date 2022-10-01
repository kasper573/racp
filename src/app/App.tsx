import { ComponentProps, StrictMode, useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { RouterSwitch } from "react-typesafe-routes";
import { HelmetProvider } from "react-helmet-async";
import { useStore } from "zustand";
import { Router } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { History } from "history";
import { Layout } from "./layout/Layout";
import { createTheme } from "./fixtures/theme";
import { themeStore } from "./state/theme";
import { trpc } from "./state/client";

export function App({
  history,
  trpcClient,
  queryClient,
  router,
}: {
  history: History;
  router: ComponentProps<typeof RouterSwitch>["router"];
  trpcClient: ComponentProps<typeof trpc.Provider>["client"];
  queryClient: ComponentProps<typeof trpc.Provider>["queryClient"];
}) {
  const { mode } = useStore(themeStore);
  const theme = useMemo(() => createTheme(mode), [mode]);
  return (
    <StrictMode>
      <Router history={history}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <HelmetProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Layout>
                  <RouterSwitch router={router} />
                </Layout>
              </ThemeProvider>
            </HelmetProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </Router>
    </StrictMode>
  );
}
