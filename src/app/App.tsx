import { FormEvent, useState } from "react";
import { getErrorMessage } from "../utils/getErrorMessage";
import {
  useAddMutation,
  useListQuery,
  useLoginMutation,
  useRemoveMutation,
} from "./client";
import { useAppDispatch, useAppSelector } from "./store";
import { auth, selectIsAuthenticated } from "./slices/auth";

export function App() {
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data, error } = useListQuery(search);
  const [add, { error: addError }] = useAddMutation();
  const [remove, { error: removeError }] = useRemoveMutation();

  function submit(e: FormEvent) {
    e.preventDefault();
    add(input);
    setInput("");
  }

  return (
    <div>
      <input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <p>
        {getErrorMessage(error)}
        {getErrorMessage(addError)}
        {getErrorMessage(removeError)}
      </p>
      <ul>
        {data?.map((item, index) => (
          <li key={index} onClick={() => remove(item)}>
            {item}
          </li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <input
          placeholder="New item"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      {isAuthenticated ? <UserInfo /> : <LoginForm />}
    </div>
  );
}

function UserInfo() {
  const username = useAppSelector((state) => state.auth.user?.username);
  const dispatch = useAppDispatch();
  return (
    <>
      <p>Signed in as {username}</p>
      <button onClick={() => dispatch(auth.actions.logout())}>Sign out</button>
    </>
  );
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { error }] = useLoginMutation();
  async function submit(e: FormEvent) {
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
