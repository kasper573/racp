import { FormEvent, useState } from "react";
import { useAddMutation, useListQuery, useRemoveMutation } from "./client";
import { useAppDispatch, useAppSelector } from "./store";
import { auth } from "./slices/auth";

export function App() {
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const { username, password } = useAppSelector(
    (state) => state.auth.credentials
  );
  const dispatch = useAppDispatch();
  const { data } = useListQuery(search);
  const [add] = useAddMutation();
  const [remove] = useRemoveMutation();

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
      </form>
      <h2>Auth</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => dispatch(auth.actions.changeUsername(e.target.value))}
      />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => dispatch(auth.actions.changePassword(e.target.value))}
      />
    </div>
  );
}
