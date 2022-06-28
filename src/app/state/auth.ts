import { createSlice, Store } from "@reduxjs/toolkit";
import * as zod from "zod";
import { client } from "../client";
import { publicUser } from "../../api/services/auth.definition";

export const authState = zod.object({
  token: zod.string().optional(),
  user: publicUser.optional(),
});

export type AuthState = zod.infer<typeof authState>;

const initialState: AuthState = {};

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      delete state.token;
      delete state.user;
    },
  },
  extraReducers: (builder) =>
    builder.addMatcher(
      client.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        if ("token" in payload) {
          state.token = payload.token;
          state.user = payload.user;
        }
      }
    ),
});

function isTokenExpired(token: string) {
  const expiry = JSON.parse(atob(token.split(".")[1])).exp;
  return Math.floor(new Date().getTime() / 1000) >= expiry;
}

export function setupAuthBehavior<S extends Store>(
  { getState, dispatch }: S,
  selectState: (state: ReturnType<Store["getState"]>) => AuthState,
  interval = 1000
) {
  const intervalId = setInterval(() => {
    const { token } = selectState(getState());
    if (token && isTokenExpired(token)) {
      dispatch(auth.actions.logout());
    }
  }, interval);
  return () => clearInterval(intervalId);
}
