import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "../store";
import { client } from "../client";
import { PublicUser } from "../../api/service.definition";

const initialState = {} as AuthState;

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

export const selectIsAuthenticated = (state: AppState) =>
  state.auth.token !== undefined;

interface AuthState {
  token?: string;
  user?: PublicUser;
}
