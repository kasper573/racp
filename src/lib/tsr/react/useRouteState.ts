import { useContext } from "react";
import { useIsMounted } from "../../hooks/useIsMounted";
import { RouteDefinition, RouteParams } from "../Route";
import { RouteResolver } from "../Router";
import { RouterContext } from "./RouterContext";
import { useRouteParams } from "./useRouteParams";

export function useRouteState<
  Def extends RouteDefinition,
  ParamName extends keyof RouteParams<Def>
>(route: RouteResolver<Def>, paramName: ParamName) {
  const isMounted = useIsMounted();
  const { history } = useContext(RouterContext);
  const params = useRouteParams(route);
  const paramValue = params?.[paramName];

  function setParamValue(value: RouteParams<Def>[ParamName]) {
    if (isMounted() && params) {
      history.replace(route({ ...params, [paramName]: value }));
    }
  }

  return [paramValue, setParamValue] as const;
}
