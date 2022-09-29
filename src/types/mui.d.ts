import { Theme as MuiTheme } from "@mui/material";
import { AppTheme } from "../app/fixtures/theme";

declare module "@mui/material/styles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends AppTheme {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ThemeOptions extends Partial<AppTheme> {}
}

declare module "@emotion/react" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends AppTheme, MuiTheme {}
}
