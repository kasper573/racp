import { useContext } from "react";
import { RouteDefinition, RouteParams } from "../types";
import { Route } from "../Route";
import { RouterContext } from "./RouterContext";

export function useRouteParams<Def extends RouteDefinition>(route: Route<Def>) {
  const { match } = useContext(RouterContext);
  if (match?.route === route) {
    return match.params as RouteParams<Def>;
  }
}
