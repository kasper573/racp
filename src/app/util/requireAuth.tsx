import { useStore } from "zustand";
import { UserAccessLevel } from "../../api/services/user/types";
import { authStore } from "../state/auth";
import { NoAccessPage } from "../pages/NoAccessPage";
import { router } from "../router";
import { t } from "../tsr";
import { Redirect } from "../../lib/tsr/react/Redirect";
import { useLocation } from "../../lib/tsr/react/useLocation";
import { normalizeLocation } from "../../lib/tsr/utils/normalizeLocation";

export function requireAuth(requiredAccess = UserAccessLevel.User) {
  return t.middleware((LockedComponent) => (props) => {
    const location = useLocation();
    const access = useStore(authStore).profile?.access;
    if (access === undefined) {
      return (
        <Redirect
          to={router.user.login({
            destination: normalizeLocation(location),
          })}
        />
      );
    }
    if (access < requiredAccess) {
      return <NoAccessPage />;
    }
    return <LockedComponent {...props} />;
  });
}
