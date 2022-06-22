import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "../store";
import { client } from "../client";

const initialState: AuthState = {};

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      delete state.token;
    },
  },
  extraReducers: (builder) =>
    builder.addMatcher(
      client.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        if ("token" in payload) {
          state.token = payload.token;
        }
      }
    ),
});

export const selectIsAuthenticated = (state: AppState) =>
  state.auth.token !== undefined;

interface AuthState {
  token?: string;
}
