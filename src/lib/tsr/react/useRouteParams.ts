import { useContext } from "react";
import { RouteDefinition, RouteParams } from "../Route";
import { RouteResolver } from "../Router";
import { RouterContext } from "./RouterContext";

export function useRouteParams<Def extends RouteDefinition>(
  route: RouteResolver<Def>
): RouteParams<Def> {
  const { match } = useContext(RouterContext);
  if (!match?.breadcrumbs.includes(route)) {
    throw new Error("useRouteParams must resolve to the given route");
  }
  return match.params as RouteParams<Def>;
}
