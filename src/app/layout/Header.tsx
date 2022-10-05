import { Breadcrumbs, Typography } from "@mui/material";
import { ComponentProps } from "react";
import { Link } from "../components/Link";
import { AnyRouteNode } from "../router";

export function Header<Arg>({
  back,
  children = "",
  sx: inputSx,
  ...rest
}: {
  back?: AnyRouteNode | [AnyRouteNode<Arg>, Arg];
} & ComponentProps<typeof Breadcrumbs>) {
  const props = { sx: { height: 24, mb: 2, ...inputSx }, ...rest };
  if (!back) {
    return <Typography {...props}>{children}</Typography>;
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
    <Breadcrumbs {...props}>
      <Link underline="hover" to={backTo} color="inherit">
        {backTitle}
      </Link>
      <Typography
        color="text.primary"
        component="div"
        sx={{ display: "flex", alignItems: "center" }}
      >
        {children}
      </Typography>
    </Breadcrumbs>
  );
}
