import { FormEvent, useState } from "react";
import { Typography } from "@mui/material";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { router } from "../router";
import { Link } from "../components/Link";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";
import { UserLoginForm } from "../forms/UserLoginForm";
import { LoginPayload } from "../../api/services/user/types";
import { useLogin } from "../state/auth";

export default function LoginPage() {
  const { destination } = useRouteParams(router.user().login);
  const [loginPayload, setLoginPayload] = useState<LoginPayload>({
    username: "",
    password: "",
  });
  const [login, { error, isLoading }] = useLogin(destination);

  async function submit(e: FormEvent) {
    e.preventDefault();
    login(loginPayload);
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
          error={error?.data}
        />

        <Typography sx={{ textAlign: "right" }}>
          Not a member?{" "}
          <Link to={router.user().register()}>Create a new account</Link>.
        </Typography>
      </CenteredContent>
    </>
  );
}
