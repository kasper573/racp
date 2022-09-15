import { FormEvent, useState } from "react";
import { Typography } from "@mui/material";
import { useHistory } from "react-router";
import { useRouteParams } from "../../lib/useRouteParams";
import { useLoginMutation } from "../state/client";
import { loginRedirect, router } from "../router";
import { Link } from "../components/Link";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";
import { UserLoginForm } from "../forms/UserLoginForm";
import { LoginPayload } from "../../api/services/user/types";

export default function LoginPage() {
  const { destination } = useRouteParams(router.user().login);
  const [loginPayload, setLoginPayload] = useState<LoginPayload>({
    username: "",
    password: "",
  });
  const [login, { error, isLoading }] = useLoginMutation();
  const history = useHistory();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = await login(loginPayload);
    if ("data" in result) {
      history.push(destination ?? loginRedirect);
    }
  }

  return (
    <>
      <Header>Sign in</Header>
      <CenteredContent>
        <UserLoginForm
          value={loginPayload}
          onChange={setLoginPayload}
          onSubmit={submit}
          isLoading={isLoading}
          error={error}
        />

        <Typography sx={{ textAlign: "right" }}>
          Not a member?{" "}
          <Link to={router.user().register()}>Create a new account</Link>.
        </Typography>
      </CenteredContent>
    </>
  );
}
