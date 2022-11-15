import { History, Location } from "history";
import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RouteMatch } from "../types";
import { Router } from "../Router";
import { normalizeLocation } from "../utils/normalizeLocation";

export interface RouterContextValue {
  router: Router;
  history: History;
  location: Location;
  match?: RouteMatch;
}

export const RouterContext = createContext<RouterContextValue>({
  router: errorProxy("Router instance must be provided"),
  history: errorProxy("History instance must be provided"),
  location: errorProxy("Location instance must be provided"),
});

export function RouterProvider({
  router,
  history,
  children,
}: PropsWithChildren<{ router: Router; history: History }>) {
  const [location, setLocation] = useState(history.location);
  useEffect(
    () => history.listen(({ location }) => setLocation(location)),
    [history]
  );

  const match = useMemo(
    () => router.match(normalizeLocation(location)),
    [router, location]
  );

  return (
    <RouterContext.Provider value={{ history, router, location, match }}>
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
