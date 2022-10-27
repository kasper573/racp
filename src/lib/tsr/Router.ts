import {
  compile as createPathFormatter,
  match as createPathMatcher,
} from "path-to-regexp";
import * as zod from "zod";
import { Route } from "./Route";
import {
  RouteDefinition,
  RouteLocationFactory,
  RouteMap,
  RouteParamsType,
  Router,
  RouteResolver,
  RouteResolverMap,
  RouterLocation,
  RouterMatch,
} from "./types";

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
  type ParamsType = Def["params"] & InheritedParams;
  type EncodedParams = Record<string, string>;

  const {
    tsr: {
      separator,
      codec: { encode, decode },
    },
    matchOptions,
  } = route.definition;

  const pathTemplate = ancestors
    .concat(route)
    .map((r) => r.definition.path)
    .join(separator);

  const ancestorsAndSelf = ancestors.concat(route);
  const paramsType = zod.object(
    ancestorsAndSelf.reduce(
      (acc, r) => ({ ...acc, ...r.definition.params }),
      {} as ParamsType
    )
  );

  const encodedParamsToPath = createPathFormatter<EncodedParams>(pathTemplate);
  const pathToEncodedParams = createPathMatcher<EncodedParams>(pathTemplate, {
    end: matchOptions?.exact ?? false,
    strict: matchOptions?.strict ?? false,
  });

  const createLocation: RouteLocationFactory<ParamsType> = (params) => {
    const encoded = Object.entries(params).reduce(
      (a, [k, v]) => ({ ...a, [k]: encode(v, paramsType.shape[k]) }),
      {}
    );
    return encodedParamsToPath(encoded) as RouterLocation;
  };

  const resolver = Object.assign(
    createLocation,
    createRouteResolvers(route.definition.children, ancestorsAndSelf, registry)
  ) as RouteResolver<Def, InheritedParams>;

  resolver.meta = route.definition.meta;
  resolver.match = (location) => {
    const encoded = pathToEncodedParams(location);
    if (!encoded) {
      return;
    }
    let decoded;
    try {
      decoded = Object.entries(encoded.params).reduce(
        (a, [k, v]) => ({ ...a, [k]: decode(v, paramsType.shape[k]) }),
        {}
      );
    } catch (e) {
      return;
    }
    return {
      params: decoded,
      breadcrumbs: ancestorsAndSelf.slice().reverse(),
    };
  };

  if (addToRegistry) {
    registry.push(resolver as RouteResolver);
  }

  return resolver;
}

