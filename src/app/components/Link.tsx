import {
  Button,
  Link as MuiLink,
  ListItemButton,
  MenuItem,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Link as RTRLink } from "react-typesafe-routes";
import { ComponentProps, forwardRef } from "react";

type RouterLinkProps = ComponentProps<typeof RTRLink>;
export type AdditionalLinkProps = Pick<RouterLinkProps, "to">;

const LinkBehavior = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function Link({ to, ...props }, ref) {
    return <RouterLink ref={ref} to={to.$} {...props} role={undefined} />;
  }
);

export function Link(
  props: ComponentProps<typeof MuiLink> & AdditionalLinkProps
) {
  return <MuiLink component={LinkBehavior} {...props} />;
}

export function LinkButton(
  props: ComponentProps<typeof Button> & AdditionalLinkProps
) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Button component={LinkBehavior} {...(props as any)} role={undefined} />
  );
}

export function LinkListItem(
  props: ComponentProps<typeof ListItemButton> & AdditionalLinkProps
) {
  return (
    <ListItemButton
      component={LinkBehavior}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      role={undefined}
    />
  );
}

export function LinkMenuItem(
  props: ComponentProps<typeof MenuItem> & AdditionalLinkProps
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <MenuItem component={LinkBehavior} {...(props as any)} />;
}
