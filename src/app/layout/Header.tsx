import { Breadcrumbs, Stack, useTheme } from "@mui/material";
import { ComponentProps, ReactNode } from "react";
import { Link } from "../components/Link";
import { RouterLocation } from "../../lib/tsr/Route";
import { RouteResolver } from "../../lib/tsr/Router";

export function Header<Arg>({
  parent,
  back,
  children = "",
  sx,
  ...props
}: {
  back?: RouteResolver;
  parent?: ReactNode;
} & ComponentProps<typeof Breadcrumbs>) {
  const theme = useTheme();

  if (back) {
    let backTitle: string;
    let backTo: RouterLocation;
    if (Array.isArray(back)) {
      const [route, routeArg] = back;
      backTitle = route.options.title;
      backTo = route(routeArg);
    } else {
      backTitle = back.meta.title;
      backTo = back({});
    }
    parent = (
      <Link underline="hover" to={backTo} color="inherit">
        {backTitle}
      </Link>
    );
  }

  if (typeof parent === "string") {
    parent = <span>{parent}</span>;
  }

  return (
    <>
      <Breadcrumbs
        role="heading"
        sx={{ height: 24, mb: 2, ...theme.typography.h6, ...sx }}
        {...props}
      >
        {parent}
        <Stack direction="row" alignItems="center">
          {children}
        </Stack>
      </Breadcrumbs>
    </>
  );
}
