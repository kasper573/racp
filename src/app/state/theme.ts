import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaletteMode } from "@mui/material";
import * as zod from "zod";

export const themeState = zod.object({
  mode: zod.union([zod.literal("dark"), zod.literal("light")]),
});

export type ThemeState = zod.infer<typeof themeState>;

const initialState: ThemeState = { mode: "dark" };

export const theme = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setMode(state, { payload }: PayloadAction<PaletteMode>) {
      state.mode = payload;
    },
  },
});
