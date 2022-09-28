import { AnyAction, createSlice, Store } from "@reduxjs/toolkit";
import * as zod from "zod";
import { createAppAsyncThunk } from "../state/utils";

export const authState = zod.object({
  token: zod.string().optional(),
});

export type AuthState = zod.infer<typeof authState>;

const initialState: AuthState = {};

export const logout = createAppAsyncThunk(
  "auth/logout",
  async (_: void, { dispatch, extra: { history, logoutRedirect } }) => {
    await dispatch(auth.actions.clear());
    if (logoutRedirect !== undefined) {
      history.push(logoutRedirect);
    }
  }
);

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    update: (state, { payload: token }: { payload: AuthState["token"] }) => {
      state.token = token;
    },
    clear(state) {
      delete state.token;
    },
  },
});

function isTokenExpired(token: string) {
  const expiry = JSON.parse(atob(token.split(".")[1])).exp;
  return Math.floor(new Date().getTime() / 1000) >= expiry;
}

export function setupAuthBehavior<State>({
  store,
  selectAuthState,
  onTokenChanged,
  interval = 1000,
}: {
  store: Store<State>;
  selectAuthState: (state: State) => AuthState;
  onTokenChanged?: () => void;
  interval?: number;
}) {
  const getToken = () => selectAuthState(store.getState()).token;

  // Logout when token expires
  const intervalId = setInterval(() => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      store.dispatch(logout() as unknown as AnyAction);
    }
  }, interval);

  let prevToken = getToken();
  const unsubscribe = store.subscribe(() => {
    const newToken = getToken();
    if (newToken !== prevToken) {
      prevToken = newToken;
      onTokenChanged?.();
    }
  });

  return () => {
    clearInterval(intervalId);
    unsubscribe();
  };
}
