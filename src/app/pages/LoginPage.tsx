import { FormEvent, useState } from "react";
import { Typography } from "@mui/material";
import { useHistory } from "react-router";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { useLoginMutation } from "../state/client";
import { loginRedirect, router } from "../router";
import { Link } from "../components/Link";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";
import { UserLoginForm } from "../forms/UserLoginForm";
import { LoginPayload } from "../../api/services/user/types";
import { useAppDispatch } from "../state/store";
import { auth } from "../slices/auth";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { destination } = useRouteParams(router.user().login);
  const [loginPayload, setLoginPayload] = useState<LoginPayload>({
    username: "",
    password: "",
  });
  const { mutateAsync: login, error, isLoading } = useLoginMutation();
  const history = useHistory();

  async function submit(e: FormEvent) {
    e.preventDefault();
    let token: string;
    try {
      token = await login(loginPayload);
    } catch {
      return;
    }
    dispatch(auth.actions.update(token));
    history.push(destination ?? loginRedirect);
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
