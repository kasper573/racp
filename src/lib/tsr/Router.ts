import {
  InferRouteParams,
  Route,
  RouteDefinition,
  RouteMap,
  RouteParams,
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

function createRouteResolvers<Routes extends RouteMap>(
  routes: Routes
): RouteResolverMap<Routes> {
  throw new Error("Not implemented");
}

export type Router<RootDef extends RouteDefinition> = RouteResolverMap<
  RootDef["children"]
> & {
  match(
    location: string
  ): RouterMatch<Route<RouteDefinition<RootDef["tsr"]>>>[];
};

export interface RouterMatch<R extends Route = any> {
  route: R;
  params: RouteParams<R>;
}

export interface RouteResolver<Def extends RouteDefinition> {
  (params: InferRouteParams<Def["params"]>): RouteResolverMap<
    Def["children"]
  > & {
    url: RouteUrl;
  };
}

export type RouteResolverMap<Routes extends RouteMap> = Readonly<{
  [K in keyof Routes]: RouteResolver<RouteDefinitionFor<Routes[K]>>;
}>;

type RouteDefinitionFor<T extends Route> = T extends Route<infer Def>
  ? Def
  : never;
