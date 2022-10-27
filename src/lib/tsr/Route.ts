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
  RouteLocation,
} from "./types";

type EncodedParams = Record<string, string>;

export function createRoute<Def extends RouteDefinition>(
  def: Def,
  parent?: AnyRouteLike<Def>
): Route<Def> {
  const ptrFormat = ptr.compile<EncodedParams>(def.path);

  // Since we want to be able to call a route to create its location, we need to use a functor.
  const functor = (params: InferRouteParams<Def["params"]>) =>
    createLocation(def, ptrFormat, params);

  Object.assign(
    functor,
    new RouteMembers(def, parent),
    getMethods(RouteMembers)
  );

  return functor as Route<Def>;
}

export interface Route<Def extends RouteDefinition = RouteDefinition>
  extends RouteMembers<Def>,
    RouteLocationFactory<Def["params"]> {}

function createLocation<Def extends RouteDefinition>(
  def: Def,
  format: ptr.PathFunction<EncodedParams>,
  params: InferRouteParams<Def["params"]>
) {
  const encoded = Object.entries(params).reduce(
    (a, [k, v]) => ({
      ...a,
      [k]: def.tsr.codec.encode(v, def.params[k]),
    }),
    {}
  );
  return format(encoded) as RouteLocation;
}

class RouteMembers<Def extends RouteDefinition> {
  private ptrMatch = ptr.match<EncodedParams>(this.def.path, {
    end: this.def.matchOptions?.exact ?? false,
    strict: this.def.matchOptions?.strict ?? false,
  });

  constructor(
    public def: Def,
    /*
      Only available when routes are in a router
     */
    public parent: AnyRouteLike<Def> | undefined
  ) {}

  render: Def["renderer"] = this.def.middlewares.reduce(
    (renderer, next) => next(renderer),
    this.def.renderer
  );

  parseLocation(location: string): InferRouteParams<Def["params"]> | undefined {
    const encoded = this.ptrMatch(location);
    if (!encoded) {
      return;
    }
    try {
      return Object.entries(encoded.params).reduce(
        (a, [k, v]) => ({
          ...a,
          [k]: this.def.tsr.codec.decode(v, this.def.params[k]),
        }),
        {} as InferRouteParams<Def["params"]>
      );
    } catch (e) {
      return;
    }
  }

  path<Path extends string>(
    path: Path,
    matchOptions?: RouteMatchOptions
  ): Route<RouteDefinition<Def["tsr"], Path, Def["params"], Def["children"]>> {
    return createRoute({ ...this.def, path, matchOptions } as any);
  }

  params<ParamsType extends RouteParamsTypeFor<Def["path"]>>(
    params: ParamsType
  ): Route<
    RouteDefinition<Def["tsr"], Def["path"], ParamsType, Def["children"]>
  > {
    return createRoute({ ...this.def, params } as any);
  }

  meta(meta: Def["meta"]): Route<Def> {
    return createRoute({ ...this.def, meta });
  }

  renderer(renderer: Def["renderer"]): Route<Def> {
    return createRoute({ ...this.def, renderer });
  }

  use(
    ...additionalMiddlewares: Array<
      RouteMiddleware<
        InferRouteParams<Def["params"]>,
        Def["tsr"]["renderResult"]
      >
    >
  ): Route<Def> {
    return createRoute({
      ...this.def,
      middlewares: [...this.def.middlewares, ...additionalMiddlewares],
    });
  }

  children<Children extends RouteMap<Def["tsr"]>>(
    children: Children
  ): Route<RouteDefinition<Def["tsr"], Def["path"], Def["params"], Children>> {
    return createRoute({ ...this.def, children } as any);
  }
}

function getMethods(clazz: new (...args: any[]) => any) {
  return Object.getOwnPropertyNames(clazz.prototype).reduce(
    (a, prop) => ({
      ...a,
      [prop]: (clazz.prototype as any)[prop],
    }),
    {}
  );
}
