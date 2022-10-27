import { Breadcrumbs, Stack, useTheme } from "@mui/material";
import { ComponentProps, ReactNode } from "react";
import { Link } from "../components/Link";
import { Route } from "../tsr";

export function Header<Arg>({
  parent,
  back,
  children = "",
  sx,
  ...props
}: {
  back?: Route;
  parent?: ReactNode;
} & ComponentProps<typeof Breadcrumbs>) {
  const theme = useTheme();

  if (back) {
    parent = (
      <Link underline="hover" to={back({})} color="inherit">
        {back.def.meta.title}
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
