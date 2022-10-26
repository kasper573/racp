import { History } from "history";
import { createContext, ReactElement } from "react";
import { Router, RouterMatch } from "../Router";
import { RouteDefinition } from "../Route";
import { TSRDefinition } from "../tsr";

export type ReactRouter = Router<
  RouteDefinition<TSRDefinition<any, ReactElement | null>>
>;

export interface RouterContextValue {
  history: History;
  match?: RouterMatch;
}

export const RouterContext = createContext<RouterContextValue>({
  history: errorProxy("History instance must be provided"),
});

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
