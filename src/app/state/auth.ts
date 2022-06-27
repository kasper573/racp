import { createSlice } from "@reduxjs/toolkit";
import * as zod from "zod";
import { AppState } from "../store";
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

export const selectIsAuthenticated = (state: AppState) =>
  state.auth.token !== undefined;

export const selectAuthenticatedUser = (state: AppState) => state.auth.user;
