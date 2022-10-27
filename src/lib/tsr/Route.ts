import * as ptr from "path-to-regexp";
import {
  AnyRouteLike,
  InferRouteParams,
  RouteDefinition,
  RouteLocationFactory,
  RouteMap,
  RouteMatchOptions,
  RouteMiddleware,
  RouteParamsTypeFor,
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
    try {
      return Object.entries(encoded.params).reduce(
        (a, [k, v]) => ({ ...a, [k]: decode(v, def.params[k]) }),
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

export interface Route<Def extends RouteDefinition = RouteDefinition>
  extends RouteLocationFactory<InferRouteParams<Def["params"]>> {
  def: Def;

  /**
   * Only available for routes in a router.
   */
  parent?: AnyRouteLike<Def>;

  render: Def["renderer"];

  parseLocation(location: string): InferRouteParams<Def["params"]> | undefined;

  path<Path extends string>(
    path: Path,
    matchOptions?: RouteMatchOptions
  ): Route<RouteDefinition<Def["tsr"], Path, Def["params"], Def["children"]>>;

  params<ParamsType extends RouteParamsTypeFor<Def["path"]>>(
    params: ParamsType
  ): Route<
    RouteDefinition<Def["tsr"], Def["path"], ParamsType, Def["children"]>
  >;

  meta(meta: Def["meta"]): Route<Def>;

  renderer(renderer: Def["renderer"]): Route<Def>;

  use(
    ...additionalMiddlewares: Array<
      RouteMiddleware<
        InferRouteParams<Def["params"]>,
        Def["tsr"]["renderResult"]
      >
    >
  ): Route<Def>;

  children<Children extends RouteMap<Def["tsr"]>>(
    children: Children
  ): Route<RouteDefinition<Def["tsr"], Def["path"], Def["params"], Children>>;
}
