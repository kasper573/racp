import { ComponentProps } from "react";
import { Link } from "../components/Link";
import { router } from "../router";

export function Logo({
  children,
  to = router.home({}),
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
