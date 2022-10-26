import { History } from "history";
import { useContext, useEffect, useState } from "react";
import { RouterContext } from "./RouterContext";

export function useLocation(manuallyProvidedHistory?: History) {
  const context = useContext(RouterContext);
  const history = manuallyProvidedHistory ?? context.history;
  const [location, setLocation] = useState(history.location);
  useEffect(
    () => history.listen(({ location }) => setLocation(location)),
    [history]
  );
  return location;
}
