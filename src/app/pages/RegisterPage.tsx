import { FormEvent, useState } from "react";
import { useHistory } from "react-router";
import { loginRedirect } from "../router";
import { useLoginMutation, useRegisterMutation } from "../state/client";
import { UserRegisterForm } from "../forms/UserRegisterForm";
import { UserRegisterPayload } from "../../api/services/auth/types";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";

export default function RegisterPage() {
  const [registerPayload, setRegisterPayload] = useState<UserRegisterPayload>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [register, { error, isLoading }] = useRegisterMutation();
  const [login] = useLoginMutation();
  const history = useHistory();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const registerResult = await register(registerPayload);
    if ("data" in registerResult && registerResult.data) {
      const loginResult = await login(registerPayload);
      if ("data" in loginResult) {
        history.push(loginRedirect);
      }
    }
  }

  return (
    <>
      <Header>Register</Header>
      <CenteredContent>
        <UserRegisterForm
          error={error}
          value={registerPayload}
          onChange={setRegisterPayload}
          onSubmit={submit}
          isLoading={isLoading}
        />
      </CenteredContent>
    </>
  );
}
