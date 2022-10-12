import { RouteMiddleware } from "react-typesafe-routes";
import { RestrictedPage } from "../pages/RestrictedPage";
import { AdminPublicSettings } from "../../api/services/settings/types";
import { trpc } from "../state/client";
import { LoadingPage } from "../pages/LoadingPage";

export function requireSettings(
  hasSettings: (settings: AdminPublicSettings) => boolean
): RouteMiddleware {
  return (next) => {
    const { data, isLoading } = trpc.settings.readPublic.useQuery();
    if (isLoading) {
      return () => <LoadingPage />;
    }
    if (!data || !hasSettings(data)) {
      return () => <RestrictedPage />;
    }
    return next;
  };
}
