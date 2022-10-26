import { ComponentProps } from "react";
import { SettingsSuggest } from "@mui/icons-material";
import { Link } from "../components/Link";
import { router } from "../router";

export function Logo({
  children,
  to = router.home({}),
  icon = true,
  ...props
}: { icon?: boolean } & Partial<ComponentProps<typeof Link>>) {
  return (
    <Link
      role="heading"
      variant="h6"
      noWrap
      sx={{
        mr: 2,
        display: "flex",
        alignItems: "center",
        fontFamily: "monospace",
        fontWeight: 700,
        letterSpacing: ".3rem",
        color: "inherit",
        textDecoration: "none",
      }}
      to={to}
      {...props}
    >
      {icon && <SettingsSuggest sx={{ display: "flex", mr: 1 }} />}
      {children}
    </Link>
  );
}
