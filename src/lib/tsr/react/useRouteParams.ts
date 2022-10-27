import { useContext } from "react";
import { RouteDefinition, RouteParams, RouteResolver } from "../types";
import { RouterContext } from "./RouterContext";

export function useRouteParams<Def extends RouteDefinition>(
  route: RouteResolver<Def>
) {
  const { match } = useContext(RouterContext);
  return match?.params as RouteParams<Def> | undefined;
}
