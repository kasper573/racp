import { Breadcrumbs, Stack, useTheme } from "@mui/material";
import { ComponentProps, ReactNode } from "react";
import { Link } from "../components/Link";
import { AnyRouteNode } from "../router";

export function Header<Arg>({
  parent,
  back,
  children = "",
  sx,
  ...props
}: {
  back?: AnyRouteNode | [AnyRouteNode<Arg>, Arg];
  parent?: ReactNode;
} & ComponentProps<typeof Breadcrumbs>) {
  const theme = useTheme();

  if (back) {
    let backTitle: string;
    let backTo: { $: string };
    if (Array.isArray(back)) {
      const [route, routeArg] = back;
      backTitle = route.options.title;
      backTo = route(routeArg);
    } else {
      backTitle = back.options.title;
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
