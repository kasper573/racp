import { useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import { ErrorMessage } from "./components/ErrorMessage";
import { useListConfigsQuery } from "./client";
import { useAppSelector } from "./store";
import { selectIsAuthenticated } from "./slices/auth";
import { LoginForm } from "./components/LoginForm";
import { UserInfo } from "./components/UserInfo";
import { ConfigList } from "./components/ConfigList";
import { ConfigEditor } from "./components/ConfigEditor";
import { Layout } from "./components/Layout";

export function App() {
  const { data, error } = useListConfigsQuery();
  const [selectedConfig, setSelectedConfig] = useState<string>();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mode = useAppSelector(({ theme }) => theme.mode);
  const back = () => setSelectedConfig(undefined);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <ErrorMessage error={error} />
        {selectedConfig ? (
          <>
            <button onClick={back}>Back</button> <span>{selectedConfig}</span>
            <br />
            <ConfigEditor configName={selectedConfig} />
          </>
        ) : (
          data && <ConfigList configs={data} onSelect={setSelectedConfig} />
        )}
        {isAuthenticated ? <UserInfo /> : <LoginForm />}
      </Layout>
    </ThemeProvider>
  );
}
