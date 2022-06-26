import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaletteMode } from "@mui/material";

export const theme = createSlice({
  name: "theme",
  initialState: { mode: "dark" as PaletteMode },
  reducers: {
    setMode(state, { payload }: PayloadAction<PaletteMode>) {
      state.mode = payload;
    },
  },
});
