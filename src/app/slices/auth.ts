import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../store";

const initialState: AuthState = {};

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, { payload }: PayloadAction<AuthState["token"]>) {
      state.token = payload;
    },
  },
});

export const selectIsAuthenticated = (state: AppState) =>
  state.auth.token !== undefined;

interface AuthState {
  token?: string;
}
