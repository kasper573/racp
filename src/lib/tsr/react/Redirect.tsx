import { useContext, useEffect } from "react";
import { RouteUrl } from "../Route";
import { RouterContext } from "./RouterContext";

export function Redirect({ to }: { to: RouteUrl }) {
  const { history } = useContext(RouterContext);

  useEffect(() => {
    history.push(to);
  }, [history, to]);

  return null;
}
