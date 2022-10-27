import { ComponentProps } from "react";
import { Link } from "../components/Link";
import { routes } from "../router";

export function Logo({
  children,
  to = routes.home({}),
  ...props
}: Partial<ComponentProps<typeof Link>>) {
  return (
    <Link
      role="heading"
      variant="h6"
      noWrap
      sx={{
        color: "inherit",
        textDecoration: "none",
      }}
      to={to}
      {...props}
    >
      {children}
    </Link>
  );
}
