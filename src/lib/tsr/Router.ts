import {
  InferRouteParams,
  Route,
  RouteDefinition,
  RouteParams,
  RouteUrl,
} from "./Route";

export function createRouter<RootDef extends RouteDefinition>(
  root: Route<RootDef>
): Router<RootDef> {
  return {
    url() {
      return "" as RouteUrl;
    },
    match(location: string) {
      throw new Error("Not implemented");
    },
  } as any;
}

export type Router<RootDef extends RouteDefinition> =
  RouteChildrenResolvers<RootDef> & {
    match(
      location: string
    ): RouterMatch<Route<RouteDefinition<RootDef["tsr"]>>>[];
  };

export interface RouterMatch<R extends Route = any> {
  route: R;
  params: RouteParams<R>;
}

export interface RouteResolver<Def extends RouteDefinition> {
  (params: InferRouteParams<Def["params"]>): RouteChildrenResolvers<Def> & {
    url: RouteUrl;
  };
}

export type RouteChildrenResolvers<Def extends RouteDefinition> = Readonly<{
  [K in keyof Def["children"]]: RouteResolver<
    RouteDefinitionFor<Def["children"][K]>
  >;
}>;

type RouteDefinitionFor<T extends Route> = T extends Route<infer Def>
  ? Def
  : never;
