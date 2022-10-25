import {
  InferRouteParams,
  Route,
  RouteDefinition,
  RouteMap,
  RouteParams,
  RouteParamsType,
  RouteUrl,
} from "./Route";

export function createRouter<RootDef extends RouteDefinition>(
  root: Route<RootDef>
): Router<RootDef> {
  return {
    ...createRouteResolvers(root.definition.children),
    match(location: string) {
      throw new Error("Not implemented");
    },
  };
}

function createRouteResolvers<
  Routes extends RouteMap,
  InheritedParams extends RouteParamsType
>(routes: Routes) {
  return Object.entries(routes).reduce((resolvers, [name, route]) => {
    resolvers[name as keyof Routes] = createRouteResolver(route);
    return resolvers;
  }, {} as RouteResolverMap<Routes, InheritedParams>);
}

function createRouteResolver<
  Def extends RouteDefinition,
  InheritedParams extends RouteParamsType
>(route: Route<Def>) {
  function resolver(params: Def["params"] & InheritedParams): RouteUrl {
    return "" as RouteUrl;
  }
  return Object.assign(
    resolver,
    createRouteResolvers(route.definition.children)
  ) as RouteResolver<Def, InheritedParams>;
}

export type Router<RootDef extends RouteDefinition> = RouteResolverMap<
  RootDef["children"],
  {}
> & {
  match(
    location: string
  ): RouterMatch<Route<RouteDefinition<RootDef["tsr"]>>>[];
};

export interface RouterMatch<R extends Route = any> {
  route: R;
  params: RouteParams<R>;
}

export type RouteResolver<
  Def extends RouteDefinition,
  InheritedParams extends RouteParamsType
> = RouteResolverMap<Def["children"], Def["params"] & InheritedParams> & {
  (params: InferRouteParams<Def["params"] & InheritedParams>): RouteUrl;
};

export type RouteResolverMap<
  Routes extends RouteMap,
  InheritedParams extends RouteParamsType
> = {
  [K in keyof Routes]: RouteResolver<
    RouteDefinitionFor<Routes[K]>,
    InheritedParams
  >;
};

type RouteDefinitionFor<T extends Route> = T extends Route<infer Def>
  ? Def
  : never;
