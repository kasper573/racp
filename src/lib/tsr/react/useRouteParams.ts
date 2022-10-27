import { useContext } from "react";
import { Route, RouteDefinition, RouteParams } from "../types";
import { RouterContext } from "./RouterContext";

export function useRouteParams<Def extends RouteDefinition>(route: Route<Def>) {
  const { match } = useContext(RouterContext);
  return match?.params as RouteParams<Def> | undefined;
}
