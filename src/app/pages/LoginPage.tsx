import { FormEvent, useState } from "react";
import { Stack, TextField, Typography } from "@mui/material";
import { useHistory } from "react-router";
import { useRouteParams } from "../../lib/useRouteParams";
import { useLoginMutation } from "../state/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { loginRedirect, router } from "../router";
import { ProgressButton } from "../components/ProgressButton";
import { Link } from "../components/Link";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";

export default function LoginPage() {
  const { destination } = useRouteParams(router.user().login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { error, isLoading }] = useLoginMutation();
  const history = useHistory();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = await login({ username, password });
    if ("data" in result) {
      history.push(destination ?? loginRedirect);
    }
  }

  return (
    <>
      <Header>Sign in</Header>
      <CenteredContent>
        <form onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div>
              <ProgressButton isLoading={isLoading} type="submit">
                Sign in
              </ProgressButton>
            </div>
            <ErrorMessage error={error} sx={{ textAlign: "center" }} />
            <Typography>
              Not a member?{" "}
              <Link to={router.user().register()}>Create a new account</Link>.
            </Typography>
          </Stack>
        </form>
      </CenteredContent>
    </>
  );
}
