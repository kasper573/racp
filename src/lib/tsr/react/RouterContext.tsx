import { History, Location } from "history";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { RouteMatch } from "../types";

export interface RouterContextValue {
  history: History;
  location: Location;
  match?: RouteMatch;
}

export const RouterContext = createContext<RouterContextValue>({
  history: errorProxy("History instance must be provided"),
  location: errorProxy("Location instance must be provided"),
});

export function RouterHistoryProvider({
  history,
  children,
}: PropsWithChildren<{ history: History }>) {
  const [location, setLocation] = useState(history.location);
  useEffect(
    () => history.listen(({ location }) => setLocation(location)),
    [history]
  );

  return (
    <RouterContext.Provider value={{ history, location }}>
      {children}
    </RouterContext.Provider>
  );
}

function errorProxy<T>(message: string) {
  return new Proxy(
    {},
    {
      get: () => {
        throw new Error(message);
      },
    }
  ) as T;
}
