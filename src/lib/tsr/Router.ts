import {
  Route,
  RouteBuilderMethods,
  RouteDefinition,
  RouteParams,
  RouteParamsType,
} from "./Route";

export function createRouter<RootDef extends RouteDefinition>(
  root: Route<RootDef>
): Router<RootDef> {
  throw new Error("Not implemented");
}

export type Router<RootDef extends RouteDefinition> = ResolvedRoute<RootDef> & {
  match(
    location: string
  ): RouterMatch<Route<RouteDefinition<RootDef["tsr"]>>>[];
};

export interface RouterMatch<R extends Route = any> {
  route: R;
  params: RouteParams<R>;
}

export type ResolvedRoute<
  Def extends RouteDefinition,
  InheritedParams extends RouteParamsType = {}
> = Omit<Route<Def["params"] & InheritedParams>, keyof RouteBuilderMethods> &
  Readonly<{
    [K in keyof Def["children"]]: ResolvedRoute<
      RouteDefinitionFor<Def["children"][K]>,
      Def["params"] & InheritedParams
    >;
  }>;

type RouteDefinitionFor<T extends Route> = T extends Route<infer Def>
  ? Def
  : never;
