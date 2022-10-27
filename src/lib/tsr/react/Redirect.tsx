import { useContext, useEffect } from "react";
import { normalizeLocation } from "../utils/normalizeLocation";
import { RouteLocation } from "../types";
import { RouterContext } from "./RouterContext";
import { useLocation } from "./useLocation";

export function Redirect({ to }: { to: RouteLocation }) {
  const { history } = useContext(RouterContext);
  const current = normalizeLocation(useLocation());

  useEffect(() => {
    if (current !== to) {
      history.replace(to);
    }
  }, [history, current, to]);

  return null;
}
