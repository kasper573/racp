import { ReactNode } from "react";
import { useStore } from "zustand";
import { UserAccessLevel, UserProfile } from "../../api/services/user/types";
import { authStore } from "../state/auth";

type AuthPropsBase = {
  children: ReactNode | ((user?: UserProfile) => ReactNode);
  fallback?: ReactNode;
};

export type AuthProps =
  | (AuthPropsBase & { exact: UserAccessLevel })
  | (AuthPropsBase & { atLeast: UserAccessLevel })
  | AuthPropsBase;

/**
 * Renders children only when the user has the required access level
 */
export function Auth({ children, fallback, ...props }: AuthProps) {
  const { profile } = useStore(authStore);
  const accessLevel = profile?.access ?? UserAccessLevel.Guest;

  let allowAccess = false;
  if ("exact" in props) {
    allowAccess = accessLevel === props.exact;
  } else if ("atLeast" in props) {
    allowAccess = accessLevel >= props.atLeast;
  } else {
    allowAccess = accessLevel > UserAccessLevel.Guest;
  }

  const childrenFn = typeof children === "function" ? children : () => children;
  return <>{allowAccess ? childrenFn(profile ?? undefined) : fallback}</>;
}
