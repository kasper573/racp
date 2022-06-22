import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  credentials: {
    username: "",
    password: "",
  },
};

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changeUsername(state, { payload }: PayloadAction<string>) {
      state.credentials.username = payload;
    },
    changePassword(state, { payload }: PayloadAction<string>) {
      state.credentials.password = payload;
    },
  },
});
