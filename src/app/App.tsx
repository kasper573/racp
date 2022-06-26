import { useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { RouterSwitch } from "react-typesafe-routes";
import { useAppSelector } from "./store";
import { Layout } from "./layout/Layout";
import { createTheme } from "./fixtures/theme";
import { router } from "./router";

export function App() {
  const mode = useAppSelector(({ theme }) => theme.mode);
  const theme = useMemo(() => createTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <RouterSwitch router={router} />
      </Layout>
    </ThemeProvider>
  );
}
