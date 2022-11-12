import { FormEvent, useState } from "react";
import { trpc } from "../state/client";
import { UserRegisterForm } from "../forms/UserRegisterForm";
import { UserRegisterPayload } from "../../api/services/user/types";
import { CenteredContent } from "../components/CenteredContent";
import { Header } from "../layout/Header";
import { useLogin } from "../state/auth";
import { Page } from "../layout/Page";

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
    <Page>
      <Header />
      <CenteredContent>
        <UserRegisterForm
          error={error?.data}
          value={registerPayload}
          onChange={setRegisterPayload}
          onSubmit={submit}
          isLoading={isLoading}
        />
      </CenteredContent>
    </Page>
  );
}
