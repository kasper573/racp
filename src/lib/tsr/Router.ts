import {
  compile as createPathFormatter,
  match as createPathMatcher,
} from "path-to-regexp";
import * as zod from "zod";
import { ZodDefault, ZodEffects, ZodNullable, ZodOptional, ZodType } from "zod";
import {
  InferRouteParams,
  Route,
  RouteDefinition,
  RouteMap,
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
  const {
    tsr: { separator, codec },
    matchOptions,
  } = route.definition;

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

  const paramsToPath = createPathFormatter(pathTemplate, {
    encode: codec.encode,
  });

  const pathToUnsafeParams = createPathMatcher<Record<string, string>>(
    pathTemplate,
    {
      decode: codec.decode,
      strict: matchOptions?.strict ?? false,
      end: matchOptions?.exact ?? false,
    }
  );

  const createLocation: RouteLocationFactory<AccumulatedParams> = (params) => {
    return paramsToPath(params) as RouterLocation;
  };

  const resolver = Object.assign(
    createLocation,
    createRouteResolvers(route.definition.children, ancestorsAndSelf, registry)
  ) as RouteResolver<Def, InheritedParams>;

  resolver.meta = route.definition.meta;
  resolver.match = (location) => {
    const match = pathToUnsafeParams(location);
    if (!match) {
      return;
    }
    const coerced = coercePrimitives(match.params, accumulatedParamsType.shape);
    const parsed = accumulatedParamsType.safeParse(coerced);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }
    return {
      params: parsed.data,
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

export interface ParamCodec {
  encode: (value: string) => string;
  decode: (value: string) => string;
}

type RouteDefinitionFor<T extends Route> = T extends Route<infer Def>
  ? Def
  : never;

function coercePrimitives(
  params: Record<string, string>,
  shape: RouteParamsType
) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    const desiredType = normalizeType(shape[key]);
    if (desiredType instanceof zod.ZodString) {
      acc[key] = value;
    } else if (desiredType instanceof zod.ZodNumber) {
      acc[key] = Number(value);
    } else if (desiredType instanceof zod.ZodBoolean) {
      acc[key] = value === "true";
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);
}

function normalizeType(type: ZodType) {
  while (
    type instanceof ZodEffects ||
    type instanceof ZodOptional ||
    type instanceof ZodNullable ||
    type instanceof ZodDefault
  ) {
    type = type instanceof ZodEffects ? type.innerType() : type._def.innerType;
  }
  return type;
}
