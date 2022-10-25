import {
  compile as createPathFormatter,
  match as createPathMatcher,
  ParseOptions,
  RegexpToFunctionOptions,
  TokensToRegexpOptions,
} from "path-to-regexp";
import * as zod from "zod";
import {
  InferRouteParams,
  Route,
  RouteDefinition,
  RouteMap,
  RouteMatchOptions,
  RouteParams,
  RouteParamsType,
  RouteUrl,
} from "./Route";

export function createRouter<RootDef extends RouteDefinition>(
  root: Route<RootDef>
): Router<RootDef> {
  let all: RouteResolver[] = [];
  const router = createRouteResolver(root, [], all, false) as Router<RootDef>;
  router.match = (location) => {
    const deepestMatches = all
      .map((r) => r.match(location))
      .filter((r) => r.length > 0)
      .sort((a, b) => b.length - a.length);
    return deepestMatches[0] || [];
  };
  return router;
}

function createRouteResolvers<
  Routes extends RouteMap,
  InheritedParams extends RouteParamsType
>(routes: Routes, ancestors: Route[], registry: RouteResolver[]) {
  return Object.entries(routes).reduce((resolvers, [name, route]) => {
    resolvers[name as keyof Routes] = createRouteResolver(
      route,
      ancestors,
      registry
    );
    return resolvers;
  }, {} as RouteResolverMap<Routes, InheritedParams>);
}

function createRouteResolver<
  Def extends RouteDefinition,
  InheritedParams extends RouteParamsType
>(
  route: Route<Def>,
  ancestors: Route[],
  registry: RouteResolver[],
  addToRegistry = true
) {
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
  const pathToParams = createPathMatcher<AccumulatedParams>(
    pathTemplate,
    translateMatchOptions(route.definition.matchOptions)
  );

  const resolver = Object.assign(
    paramsToPath,
    createRouteResolvers(route.definition.children, ancestorsAndSelf, registry)
  ) as RouteResolver<Def, InheritedParams>;

  resolver.match = (location) => {
    const matchResult = pathToParams(location);
    if (!matchResult) {
      return [];
    }
    const parseResult = accumulatedParamsType.safeParse(
      coercePrimitives(matchResult.params, accumulatedParamsType.shape)
    );
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

  if (addToRegistry) {
    registry.push(resolver as RouteResolver);
  }

  return resolver;
}

export type Router<RootDef extends RouteDefinition = any> = RouteResolver<
  RootDef,
  {}
>;

export interface RouterMatch<R extends Route = any> {
  route: R;
  params: RouteParams<R>;
}

export type RouteResolver<
  Def extends RouteDefinition = any,
  InheritedParams extends RouteParamsType = {}
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

function coercePrimitives(
  params: Record<string, string>,
  shape: RouteParamsType
) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    const field = shape[key];
    if (field instanceof zod.ZodString) {
      acc[key] = value;
    } else if (field instanceof zod.ZodNumber) {
      acc[key] = Number(value);
    } else if (field instanceof zod.ZodBoolean) {
      acc[key] = value === "true";
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);
}

function translateMatchOptions({
  strict = false,
  exact = false,
}: RouteMatchOptions = {}): ParseOptions &
  TokensToRegexpOptions &
  RegexpToFunctionOptions {
  return {
    decode: decodeURIComponent,
    strict,
    end: exact,
  };
}
