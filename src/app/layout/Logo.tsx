import { ComponentProps } from "react";
import { SettingsSuggest } from "@mui/icons-material";
import { Link } from "../components/Link";

export function Logo(props: ComponentProps<typeof Link>) {
  return (
    <>
      <SettingsSuggest sx={{ display: "flex", mr: 1 }} />
      <Link
        variant="h6"
        noWrap
        sx={{
          mr: 2,
          display: { xs: "none", md: "flex" },
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: ".3rem",
          color: "inherit",
          textDecoration: "none",
        }}
        {...props}
      />
    </>
  );
}
