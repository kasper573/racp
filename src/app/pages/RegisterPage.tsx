import { FormEvent, useState } from "react";
import { useHistory } from "react-router";
import { loginRedirect } from "../router";
import { useLoginMutation, useRegisterMutation } from "../state/client";
import { UserRegisterForm } from "../forms/UserRegisterForm";
import { UserRegisterPayload } from "../../api/services/user/types";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";

export default function RegisterPage() {
  const [registerPayload, setRegisterPayload] = useState<UserRegisterPayload>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const { mutateAsync: register, error, isLoading } = useRegisterMutation();
  const { mutateAsync: login } = useLoginMutation();
  const history = useHistory();

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await register(registerPayload);
      await login(registerPayload);
      history.push(loginRedirect);
    } catch {
      // Do nothing
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
