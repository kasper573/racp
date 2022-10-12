import { Redirect, RouteMiddleware } from "react-typesafe-routes";
import { useLocation } from "react-router-dom";
import { useStore } from "zustand";
import { UserAccessLevel } from "../../api/services/user/types";
import { authStore } from "../state/auth";
import { RestrictedPage } from "../pages/RestrictedPage";
import { router } from "../router";

export function requireAuth(
  requiredAccess = UserAccessLevel.User
): RouteMiddleware {
  return (next) => {
    const location = useLocation();
    const access = useStore(authStore).profile?.access;
    if (access === undefined) {
      return () => (
        <Redirect
          to={router.user().login({
            destination: `${location.pathname}${location.search}`,
          })}
        />
      );
    }
    if (access < requiredAccess) {
      return () => <RestrictedPage />;
    }
    return next;
  };
}
