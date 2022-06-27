import { GlobalStyles } from "@mui/material";

export const rootId = "root";

export const globalStyles = (
  <GlobalStyles
    styles={{
      [`#${rootId}`]: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      },
    }}
  />
);
