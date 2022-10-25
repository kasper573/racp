import {
  Route,
  RouteDefinition,
  RouteParams,
  RouteParamsType,
  RouteUrlFactory,
} from "./Route";

export function createRouter<Root extends Route>(root: Root): Router<Root> {
  throw new Error("Not implemented");
}

export type Router<Root extends Route> = ResolvedRoute<Root["definition"]> & {
  match(location: string): RouterMatch[];
  render(location: string): Root["definition"]["tsr"]["renderResult"];
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
    Def["children"][K]["definition"],
    Def["params"] & InheritedParams
  >;
}>;
