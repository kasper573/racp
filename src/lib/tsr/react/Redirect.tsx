import { useContext, useEffect } from "react";
import { RouterLocation } from "../Route";
import { RouterContext } from "./RouterContext";

export function Redirect({ to }: { to: RouterLocation }) {
  const { history } = useContext(RouterContext);

  useEffect(() => {
    history.push(to);
  }, [history, to]);

  return null;
}
