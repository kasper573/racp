import { PaletteMode } from "@mui/material";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";

export const themeStore = createStore<{
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
}>()(
  persist(
    (set) => ({
      mode: "dark",
      setMode: (mode) => set((state) => ({ ...state, mode })),
    }),
    { name: "theme" }
  )
);
