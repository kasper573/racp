import { useEffect } from "react";
import { useHistory } from "react-router";

export function useBlockNavigation(enabled: boolean, message: string) {
  const history = useHistory();
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const unblock = history.block(() => {
      if (window.confirm(message)) {
        unblock();
      } else {
        return false;
      }
    });
    return unblock;
  }, [enabled, history, message]);
}
