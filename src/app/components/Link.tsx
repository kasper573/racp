import {
  Button,
  Link as MuiLink,
  ListItemButton,
  MenuItem,
} from "@mui/material";
import { ComponentProps, forwardRef } from "react";
import { RouterLink, RouterLinkProps } from "../../lib/tsr/react/RouterLink";
import { useLocation } from "../../lib/tsr/react/useLocation";
import { RouterLocation } from "../../lib/tsr/types";

export type AdditionalLinkProps = Pick<RouterLinkProps, "to">;

export type LinkTo = AdditionalLinkProps["to"];

export const LinkBase = MuiLink;

const LinkBehavior = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function Link({ to, role, ...props }, ref) {
    return <RouterLink ref={ref} to={to} {...props} role={role} />;
  }
);

export function Link(
  props: ComponentProps<typeof LinkBase> & AdditionalLinkProps
) {
  return <LinkBase component={LinkBehavior} {...props} />;
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
      selected={useIsActive(props.to)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      role={undefined}
    />
  );
}

export function LinkMenuItem(
  props: ComponentProps<typeof MenuItem> & AdditionalLinkProps
) {
  return (
    <MenuItem
      component={LinkBehavior}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    />
  );
}

function useIsActive(to: RouterLocation) {
  const location = useLocation();
  return location.pathname.startsWith(to);
}
