import { FormEvent, useState } from "react";
import { trpc } from "../state/client";
import { UserRegisterForm } from "../forms/UserRegisterForm";
import { UserRegisterPayload } from "../../api/services/user/types";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";
import { useLogin } from "../state/auth";

export default function RegisterPage() {
  const [registerPayload, setRegisterPayload] = useState<UserRegisterPayload>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const {
    mutateAsync: register,
    error,
    isLoading,
  } = trpc.user.register.useMutation();
  const [login] = useLogin();

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await register(registerPayload);
    } catch {
      return;
    }
    login(registerPayload);
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
