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
  RouterLocation,
} from "./Route";

export function createRouter<RootDef extends RouteDefinition>(
  root: Route<RootDef>
): Router<RootDef> {
  let all: RouteResolver[] = [];
  const router = createRouteResolver(root, [], all, false) as Router<RootDef>;
  router.match = (location) => {
    const [bestMatch] = all
      .map((r) => r.match(location))
      .filter((match): match is RouterMatch => !!match)
      .sort((a, b) => b.breadcrumbs.length - a.breadcrumbs.length);
    return bestMatch;
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
  const { separator, protocol } = route.definition.tsr;

  const pathTemplate = ancestors
    .concat(route)
    .map((r) => r.definition.path)
    .join(separator);

  const ancestorsAndSelf = ancestors.concat(route);
  type AccumulatedParams = Def["params"] & InheritedParams;
  const accumulatedParamsType = zod.object(
    ancestorsAndSelf.reduce(
      (acc, r) => ({ ...acc, ...r.definition.params }),
      {} as AccumulatedParams
    )
  );

  const paramsToPath = createPathFormatter(pathTemplate);
  const pathToParams = createPathMatcher<AccumulatedParams>(
    pathTemplate,
    translateMatchOptions(route.definition.matchOptions)
  );

  const createLocation: RouteLocationFactory<AccumulatedParams> = (params) => {
    return paramsToPath(protocol.serialize(params)) as RouterLocation;
  };

  const resolver = Object.assign(
    createLocation,
    createRouteResolvers(route.definition.children, ancestorsAndSelf, registry)
  ) as RouteResolver<Def, InheritedParams>;

  resolver.meta = route.definition.meta;
  resolver.match = (location) => {
    const matchResult = pathToParams(location);
    if (!matchResult) {
      return;
    }
    const deserialized = protocol.parse(matchResult.params);
    const parseResult = accumulatedParamsType.safeParse(deserialized);
    if (!parseResult.success) {
      return;
    }
    return {
      params: parseResult.data,
      breadcrumbs: ancestorsAndSelf.slice().reverse(),
    };
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
  breadcrumbs: R[];
  params: RouteParams<R>;
}

export type RouteResolver<
  Def extends RouteDefinition = any,
  InheritedParams extends RouteParamsType = {}
> = RouteResolverMap<Def["children"], Def["params"] & InheritedParams> &
  RouteLocationFactory<Def["params"] & InheritedParams> & {
    meta: Def["meta"];
    match(
      location: string
    ): RouterMatch<Route<RouteDefinition<Def["tsr"]>>> | undefined;
  };

export interface RouteLocationFactory<Params extends RouteParamsType> {
  (params: InferRouteParams<Params>): RouterLocation;
}

export type RouteResolverMap<
  Routes extends RouteMap,
  InheritedParams extends RouteParamsType
> = {
  [K in keyof Routes]: RouteResolver<
    RouteDefinitionFor<Routes[K]>,
    InheritedParams
  >;
};

export interface RouteParamSerializationProtocol {
  parse(serializedParamValue: string): unknown;
  stringify(paramValue: unknown): string;
}

export class RouteParamRecordSerializationProtocol {
  constructor(private protocol: RouteParamSerializationProtocol) {}
  serialize(params: Record<string, unknown>): Record<string, string> {
    return Object.entries(params).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: this.protocol.stringify(v) }),
      {}
    );
  }

  parse(serialized: Record<string, string>): Record<string, unknown> {
    return Object.entries(serialized).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: this.protocol.parse(v) }),
      {}
    );
  }
}

type RouteDefinitionFor<T extends Route> = T extends Route<infer Def>
  ? Def
  : never;

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
