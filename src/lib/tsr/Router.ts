import {
  Route,
  RouteDefinition,
  RouteParams,
  RouteParamsType,
  RouteUrlFactory,
} from "./Route";

export function createRouter<RootDef extends RouteDefinition>(
  root: Route<RootDef>
): Router<RootDef> {
  throw new Error("Not implemented");
}

export type Router<RootDef extends RouteDefinition> = ResolvedRoute<RootDef> & {
  match(location: string): RouterMatch[];
  render(location: string): RootDef["tsr"]["renderResult"];
};

export interface RouterMatch<R extends Route = any> {
  route: R;
  params: RouteParams<R>;
}

export type ResolvedRoute<
  Def extends RouteDefinition,
  InheritedParams extends RouteParamsType = {}
> = {
  definition: Def;
  createUrl: RouteUrlFactory<Def["params"] & InheritedParams>;
} & Readonly<{
  [K in keyof Def["children"]]: ResolvedRoute<
    RouteDefinitionFor<Def["children"][K]>,
    Def["params"] & InheritedParams
  >;
}>;

type RouteDefinitionFor<T extends Route> = T extends Route<infer Def>
  ? Def
  : never;
