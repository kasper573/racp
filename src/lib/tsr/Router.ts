import {
  compile as createPathFormatter,
  match as createPathMatcher,
} from "path-to-regexp";
import * as zod from "zod";
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
  return createRouteResolver(root, []);
}

function createRouteResolvers<
  Routes extends RouteMap,
  InheritedParams extends RouteParamsType
>(routes: Routes, ancestors: Route[]) {
  return Object.entries(routes).reduce((resolvers, [name, route]) => {
    resolvers[name as keyof Routes] = createRouteResolver(route, ancestors);
    return resolvers;
  }, {} as RouteResolverMap<Routes, InheritedParams>);
}

function createRouteResolver<
  Def extends RouteDefinition,
  InheritedParams extends RouteParamsType
>(route: Route<Def>, ancestors: Route[]) {
  const pathTemplate = ancestors
    .concat(route)
    .map((r) => r.definition.path)
    .join("/");

  const ancestorsAndSelf = ancestors.concat(route);
  type AccumulatedParams = InheritedParams & Def["params"];
  const accumulatedParamsType = zod.object(
    ancestorsAndSelf.reduce(
      (acc, r) => ({ ...acc, ...r.definition.params }),
      {} as AccumulatedParams
    )
  );

  const paramsToPath = createPathFormatter<AccumulatedParams>(pathTemplate);
  const pathToParams = createPathMatcher<AccumulatedParams>(pathTemplate, {
    decode: decodeURIComponent,
  });

  const resolver = Object.assign(
    paramsToPath,
    createRouteResolvers(route.definition.children, ancestorsAndSelf)
  ) as RouteResolver<Def, InheritedParams>;

  resolver.match = (location) => {
    const matchResult = pathToParams(location);
    if (!matchResult) {
      return [];
    }
    const parseResult = accumulatedParamsType.safeParse(matchResult.params);
    if (!parseResult.success) {
      return [];
    }
    return ancestorsAndSelf
      .slice()
      .reverse()
      .map((route) => ({
        params: parseResult.data,
        route,
      }));
  };

  return resolver;
}

export type Router<RootDef extends RouteDefinition> = RouteResolver<
  RootDef,
  {}
>;

export interface RouterMatch<R extends Route = any> {
  route: R;
  params: RouteParams<R>;
}

export type RouteResolver<
  Def extends RouteDefinition,
  InheritedParams extends RouteParamsType
> = RouteResolverMap<Def["children"], Def["params"] & InheritedParams> & {
  (params: InferRouteParams<Def["params"] & InheritedParams>): RouteUrl;
  match(location: string): RouterMatch<Route<RouteDefinition<Def["tsr"]>>>[];
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
