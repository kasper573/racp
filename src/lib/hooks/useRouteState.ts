import { useHistory } from "react-router";
import { RouteNodeWithParams } from "react-typesafe-routes/dist/routeNode";
import { useRouteParams } from "./useRouteParams";

export function useRouteState<
  Route extends AnyRouteNode,
  Prop extends keyof RouteParams<Route>
>(route: Route, prop: Prop) {
  type Params = RouteParams<Route>;
  type State = Params[Prop];
  const history = useHistory();
  const params = useRouteParams(route);
  const state = params[prop];
  const setState = (value: State) =>
    history.replace(route({ ...params, [prop]: value }).$);
  return [state, setState] as const;
}

type AnyRouteNode = RouteNodeWithParams<string, any, any, any>;
type RouteParams<Node extends AnyRouteNode> = ReturnType<Node["parseParams"]>;
