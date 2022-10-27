import * as ptr from "path-to-regexp";
import {
  AnyRouteLike,
  InferRouteParams,
  Route,
  RouteDefinition,
  RouterLocation,
} from "./types";

type EncodedParams = Record<string, string>;

export function createRoute<Def extends RouteDefinition>(
  def: Def,
  parent?: AnyRouteLike<Def>
): Route<Def> {
  const { encode, decode } = def.tsr.codec;
  const ptrFormat = ptr.compile<EncodedParams>(def.path);
  const ptrMatch = ptr.match<EncodedParams>(def.path, {
    end: def.matchOptions?.exact ?? false,
    strict: def.matchOptions?.strict ?? false,
  });

  const route = createLocation as Route<Def>;
  route.def = def;
  route.parent = parent;
  route.render = def.middlewares.reduce(
    (renderer, next) => next(renderer),
    def.renderer
  );

  function createLocation(params: InferRouteParams<Def["params"]>) {
    const encoded = Object.entries(params).reduce(
      (a, [k, v]) => ({
        ...a,
        [k]: encode(v, def.params[k]),
      }),
      {}
    );
    return ptrFormat(encoded) as RouterLocation;
  }

  route.parseLocation = (location: string) => {
    const encoded = ptrMatch(location);
    if (!encoded) {
      return;
    }
    const q = Object.entries(encoded.params).map(([k, v]) => [
      [k, v],
      def.params[k],
    ]);
    try {
      return q.reduce(
        (a, [[k, v], type]) => ({ ...a, [k]: decode(v, type) }),
        {} as InferRouteParams<Def["params"]>
      );
    } catch (e) {
      return;
    }
  };

  route.path = (path, matchOptions) =>
    createRoute({ ...def, path, matchOptions } as any);
  route.params = (params) => createRoute({ ...def, params } as any);
  route.meta = (meta) => createRoute({ ...def, meta });
  route.renderer = (renderer) => createRoute({ ...def, renderer });
  route.children = (children) => createRoute({ ...def, children } as any);
  route.use = (...additionalMiddlewares) =>
    createRoute({
      ...def,
      middlewares: [...def.middlewares, ...additionalMiddlewares],
    });

  return route;
}
