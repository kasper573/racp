import { useContext, useEffect } from "react";
import { RouterLocation } from "../Route";
import { normalizeLocation } from "../normalizeLocation";
import { RouterContext } from "./RouterContext";
import { useLocation } from "./useLocation";

export function Redirect({
  to,
  when = "not-on-sub-path",
}: {
  to: RouterLocation;
  when?: "not-on-sub-path" | "always";
}) {
  const { history } = useContext(RouterContext);
  const current = normalizeLocation(useLocation());

  useEffect(() => {
    if (shouldRedirect(when, to, current)) {
      console.log("Redirecting from", current, "to", to);
      history.push(to);
    }
  }, [history, when, current, to]);

  return null;
}

export type RedirectWhen = "not-on-sub-path" | "always";

function shouldRedirect(when: RedirectWhen, current: string, to: string) {
  if (to === current) {
    return false;
  }
  return when === "always" || !to.startsWith(current);
}
