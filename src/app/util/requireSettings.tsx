import { NoAccessPage } from "../pages/NoAccessPage";
import { AdminPublicSettings } from "../../api/services/settings/types";
import { trpc } from "../state/client";
import { t } from "../tsr";

export function requireSettings(
  hasSettings: (settings: AdminPublicSettings) => boolean
) {
  return t.middleware((LockedComponent) => (props) => {
    const { data, isLoading } = trpc.settings.readPublic.useQuery();
    if (isLoading) {
      return null;
    }
    if (!data || !hasSettings(data)) {
      return <NoAccessPage />;
    }
    return <LockedComponent {...props} />;
  });
}
