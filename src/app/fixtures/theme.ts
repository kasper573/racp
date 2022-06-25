import { createTheme as createMuiTheme, PaletteMode } from "@mui/material";

export function createTheme(mode: PaletteMode) {
  return createMuiTheme({ palette: { mode } });
}

export interface AppTheme {
  custom: string;
}
