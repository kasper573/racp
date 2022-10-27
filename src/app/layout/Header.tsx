import { Breadcrumbs, Stack, useTheme } from "@mui/material";
import { ComponentProps, ReactNode, useContext } from "react";
import { Link } from "../components/Link";
import { RouterContext } from "../../lib/tsr/react/RouterContext";

export function Header<Arg>({
  title,
  children,
  breadcrumbs = true,
  sx,
  ...props
}: {
  title?: ReactNode;
  breadcrumbs?: boolean;
} & Omit<ComponentProps<typeof Breadcrumbs>, "title">) {
  const theme = useTheme();
  const { match } = useContext(RouterContext);

  const skipActiveRouteBreadcrumb = title !== undefined;
  let breadcrumbNodes: ReactNode[] = [];
  let route = match?.route;
  if (skipActiveRouteBreadcrumb) {
    route = route?.parent;
  }

  while (match && route) {
    if (route.def.meta.title) {
      breadcrumbNodes.unshift(
        route.def.renderer ? (
          <Link
            key={breadcrumbNodes.length}
            underline="hover"
            to={route(match.params)}
            color="inherit"
          >
            {route.def.meta.title}
          </Link>
        ) : (
          <span key={breadcrumbNodes.length}>{route.def.meta.title}</span>
        )
      );
    }
    route = route.parent;
  }

  return (
    <Stack direction="row" alignItems="center">
      <Breadcrumbs
        role="heading"
        sx={{ height: 24, mb: 2, ...theme.typography.h6, ...sx }}
        {...props}
      >
        {breadcrumbNodes}
        {title && (
          <Stack direction="row" alignItems="center">
            {title}
          </Stack>
        )}
      </Breadcrumbs>
      {children}
    </Stack>
  );
}
