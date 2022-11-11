import { FormEvent, useState } from "react";
import { Typography } from "@mui/material";
import { routes } from "../router";
import { Link } from "../components/Link";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";
import { UserLoginForm } from "../forms/UserLoginForm";
import { LoginPayload } from "../../api/services/user/types";
import { useLogin } from "../state/auth";
import { RouteComponentProps } from "../../lib/tsr/react/types";
import { RouteLocation } from "../../lib/tsr/types";
import { Page } from "../layout/Page";

export default function LoginPage({
  params: { destination },
}: RouteComponentProps<{ destination?: RouteLocation }>) {
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
    <Page>
      <Header />
      <CenteredContent>
        <UserLoginForm
          value={loginPayload}
          onChange={setLoginPayload}
          onSubmit={submit}
          isLoading={isLoading}
          error={error?.data}
          sx={{ mb: 2 }}
        />

        <Typography sx={{ textAlign: "right" }}>
          Not a member?{" "}
          <Link to={routes.user.register({})}>Create a new account</Link>.
        </Typography>
      </CenteredContent>
    </Page>
  );
}
