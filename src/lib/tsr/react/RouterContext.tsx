import { Location, History } from "history";
import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Router, RouterMatch } from "../Router";
import { RouteDefinition } from "../Route";
import { TSRDefinition } from "../tsr";

export type ReactRouter = Router<
  RouteDefinition<TSRDefinition<any, ReactElement | null>>
>;

export interface RouterContextValue {
  history: History;
  location: Location;
  match?: RouterMatch;
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
