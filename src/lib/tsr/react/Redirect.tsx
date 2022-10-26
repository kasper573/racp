import { useContext, useEffect } from "react";
import { RouterLocation } from "../Route";
import { normalizeLocation } from "../utils/normalizeLocation";
import { RouterContext } from "./RouterContext";
import { useLocation } from "./useLocation";

export function Redirect({ to }: { to: RouterLocation }) {
  const { history } = useContext(RouterContext);
  const current = normalizeLocation(useLocation());

  useEffect(() => {
    if (current !== to) {
      history.replace(to);
    }
  }, [history, current, to]);

  return null;
}
