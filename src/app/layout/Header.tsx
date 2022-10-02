import { Breadcrumbs, Typography } from "@mui/material";
import { ReactNode } from "react";
import { Link } from "../components/Link";
import { AnyRouteNode } from "../router";

export function Header<Arg>({
  back,
  children = "",
}: {
  back?: AnyRouteNode | [AnyRouteNode<Arg>, Arg];
  children?: ReactNode;
}) {
  const style = { height: 24, mb: 2 };
  if (!back) {
    return <Typography sx={style}>{children}</Typography>;
  }

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

  return (
    <Breadcrumbs sx={style}>
      <Link underline="hover" to={backTo} color="inherit">
        {backTitle}
      </Link>
      <Typography color="text.primary">{children}</Typography>
    </Breadcrumbs>
  );
}
