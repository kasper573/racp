import {
  AnyRouteLike,
  Route,
  RouteDefinition,
  RouteMap,
  RouteParamsType,
} from "./types";
import { createRoute } from "./Route";

export function createCascadedRoute<
  R extends Route,
  Prefix extends string,
  InheritedParams extends RouteParamsType
>(
  { def }: R,
  prefix: Prefix,
  inheritedParams: InheritedParams,
  parent?: AnyRouteLike<R>
): CascadedRoute<R> {
  const path = prefix + def.path;
  const params = { ...inheritedParams, ...def.params };
  const cascaded = createRoute({ ...def, path, params }, parent);

  cascaded.def.children = Object.entries(def.children).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: createCascadedRoute(
        v as Route,
        path + def.tsr.separator,
        params,
        cascaded
      ),
    }),
    {}
  );
  return cascaded;
}

export type CascadedRoute<R extends Route> = Route<
  CascadedRouteDefinition<R["def"], "", {}>
>;

export type CascadedRouteDefinition<
  Def extends RouteDefinition,
  Prefix extends string,
  InheritedParams extends RouteParamsType
> = RouteDefinition<
  Def["tsr"],
  `${Prefix}${Def["path"]}`,
  Def["params"] & InheritedParams,
  CascadedRouteMap<
    Def["children"],
    `${Prefix}${Def["path"]}${Def["tsr"]["separator"]}`,
    Def["params"] & InheritedParams
  >
>;

export type CascadedRouteMap<
  Map extends RouteMap,
  Prefix extends string,
  InheritedParams extends RouteParamsType
> = {
  [K in keyof Map]: Route<
    CascadedRouteDefinition<Map[K]["def"], Prefix, InheritedParams>
  >;
};
