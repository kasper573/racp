import { ComponentProps, StrictMode, useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { useStore } from "zustand";
import { QueryClientProvider } from "@tanstack/react-query";
import { History } from "history";
import { ErrorBoundary } from "react-error-boundary";
import { RouterHistoryProvider } from "../lib/tsr/react/RouterContext";
import { RouterSwitch } from "../lib/tsr/react/RouterSwitch";
import { ReactRouter } from "../lib/tsr/react/types";
import { Layout } from "./layout/Layout";
import { createTheme } from "./fixtures/theme";
import { themeStore } from "./state/theme";
import { trpc } from "./state/client";
import { ErrorFallback } from "./ErrorFallback";

export function App({
  history,
  trpcClient,
  queryClient,
  router,
}: {
  history: History;
  router: ReactRouter;
  trpcClient: ComponentProps<typeof trpc.Provider>["client"];
  queryClient: ComponentProps<typeof trpc.Provider>["queryClient"];
}) {
  const { mode } = useStore(themeStore);
  const theme = useMemo(() => createTheme(mode), [mode]);
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error(error)}
    >
      <StrictMode>
        <RouterHistoryProvider history={history}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <HelmetProvider>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <Layout>
                    <RouterSwitch router={router} variant="leaf" />
                  </Layout>
                </ThemeProvider>
              </HelmetProvider>
            </QueryClientProvider>
          </trpc.Provider>
        </RouterHistoryProvider>
      </StrictMode>
    </ErrorBoundary>
  );
}
