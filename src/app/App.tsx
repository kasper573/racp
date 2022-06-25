import { FormEvent, useState } from "react";
import { getErrorMessage } from "../utils/getErrorMessage";
import {
  useGetConfigQuery,
  useListConfigsQuery,
  useLoginMutation,
  useUpdateConfigMutation,
} from "./client";
import { useAppDispatch, useAppSelector } from "./store";
import {
  auth,
  selectAuthenticatedUser,
  selectIsAuthenticated,
} from "./slices/auth";
import { TextEditor } from "./TextEditor";

export function App() {
  const { data, error } = useListConfigsQuery();
  const [selectedConfig, setSelectedConfig] = useState<string>();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const back = () => setSelectedConfig(undefined);
  return (
    <div>
      {getErrorMessage(error)}
      {selectedConfig ? (
        <>
          <button onClick={back}>Back</button> <span>{selectedConfig}</span>
          <br />
          <ConfigEditor configName={selectedConfig} />
        </>
      ) : (
        data && <ConfigList configs={data} onSelect={setSelectedConfig} />
      )}
      {isAuthenticated ? <UserInfo /> : <LoginForm />}
    </div>
  );
}

function ConfigEditor({ configName }: { configName: string }) {
  const { data: value } = useGetConfigQuery(configName);
  const [update] = useUpdateConfigMutation();
  const setValue = (content: string) => update({ name: configName, content });
  return <TextEditor value={value} onChange={setValue} />;
}

function ConfigList({
  configs,
  onSelect,
}: {
  configs: string[];
  onSelect: (config: string) => void;
}) {
  return (
    <ul>
      {configs.map((item, index) => (
        <li key={index} onClick={() => onSelect(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function UserInfo() {
  const user = useAppSelector(selectAuthenticatedUser);
  const dispatch = useAppDispatch();
  return (
    <>
      <p>Signed in as {user?.username}</p>
      <button onClick={() => dispatch(auth.actions.logout())}>Sign out</button>
    </>
  );
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { error }] = useLoginMutation();
  function submit(e: FormEvent) {
    e.preventDefault();
    login({ username, password });
  }
  return (
    <form onSubmit={submit}>
      <h2>Auth</h2>
      <p>{getErrorMessage(error)}</p>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button type="submit">Sign in</button>
    </form>
  );
}
