import { useContext, useEffect, useRef } from "react";
import { RouterLocation } from "../Route";
import { RouterContext } from "./RouterContext";

export function Redirect({ to }: { to: RouterLocation }) {
  const { history } = useContext(RouterContext);

  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      history.replace(to);
    }
  }, [history, to]);

  return null;
}
