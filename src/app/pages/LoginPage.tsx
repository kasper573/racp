import { FormEvent, useState } from "react";
import { Button, Stack, styled, TextField } from "@mui/material";
import { useLoginMutation } from "../client";
import { ErrorMessage } from "../components/ErrorMessage";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { error }] = useLoginMutation();

  function submit(e: FormEvent) {
    e.preventDefault();
    login({ username, password });
  }

  return (
    <Form onSubmit={submit}>
      <Stack spacing={2}>
        <TextField
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Sign in</Button>
        <ErrorMessage error={error} sx={{ textAlign: "center" }} />
      </Stack>
    </Form>
  );
}

const Form = styled("form")`
  display: block;
  margin: auto;
  max-width: 375px;
  position: relative;
  ${({ theme }) => theme.breakpoints.up("sm")} {
    top: 20%;
  }
`;
