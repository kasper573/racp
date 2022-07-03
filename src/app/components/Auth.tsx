import { ReactNode } from "react";
import { useAppSelector } from "../store";
import {
  PublicUser,
  UserAccessLevel,
} from "../../api/services/auth/auth.types";

type AuthPropsBase = {
  children: ReactNode | ((user?: PublicUser) => ReactNode);
  fallback?: ReactNode;
};

export type AuthProps =
  | (AuthPropsBase & { exact: UserAccessLevel })
  | (AuthPropsBase & { atLeast: UserAccessLevel })
  | AuthPropsBase;

export function Auth({ children, fallback, ...props }: AuthProps) {
  const user = useAppSelector(({ auth }) => auth.user);
  const accessLevel = user?.access ?? UserAccessLevel.Guest;

  let allowAccess = false;
  if ("exact" in props) {
    allowAccess = accessLevel === props.exact;
  } else if ("atLeast" in props) {
    allowAccess = accessLevel >= props.atLeast;
  } else {
    allowAccess = accessLevel > UserAccessLevel.Guest;
  }

  const childrenFn = typeof children === "function" ? children : () => children;
  return <>{allowAccess ? childrenFn(user) : fallback}</>;
}
