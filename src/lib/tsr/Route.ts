import {
  InferRouteParams,
  RouteDefinition,
  RouteMap,
  RouteMatchOptions,
  RouteMiddleware,
  RouteParamsTypeFor,
} from "./types";

export class RouteBuilderMethods<Def extends RouteDefinition = any> {
  readonly definition: Readonly<Def>;

  constructor(definition: Def) {
    this.definition = definition;
  }

  path<Path extends string>(path: Path, matchOptions?: RouteMatchOptions) {
    return new Route({
      ...this.definition,
      path,
      matchOptions,
    } as RouteDefinition<Def["tsr"], Path, Def["params"], Def["children"]>);
  }

  params<ParamsType extends RouteParamsTypeFor<Def["path"]>>(
    params: ParamsType
  ) {
    return new Route({ ...this.definition, params } as RouteDefinition<
      Def["tsr"],
      Def["path"],
      ParamsType,
      Def["children"]
    >);
  }

  meta(meta: Def["meta"]) {
    return new Route<Def>({ ...this.definition, meta });
  }

  renderer(renderer: Def["renderer"]): Route<Def> {
    return new Route<Def>({ ...this.definition, renderer });
  }

  use(
    ...additionalMiddlewares: Array<
      RouteMiddleware<
        InferRouteParams<Def["params"]>,
        Def["tsr"]["renderResult"]
      >
    >
  ): Route<Def> {
    return new Route<Def>({
      ...this.definition,
      middlewares: [...this.definition.middlewares, ...additionalMiddlewares],
    });
  }

  children<Children extends RouteMap<Def["tsr"]>>(children: Children) {
    return new Route({ ...this.definition, children } as RouteDefinition<
      Def["tsr"],
      Def["path"],
      Def["params"],
      Children
    >);
  }
}

export class Route<
  Def extends RouteDefinition = any
> extends RouteBuilderMethods<Def> {
  readonly render: Def["renderer"] = this.definition.middlewares.reduce(
    (renderer, next) => next(renderer),
    this.definition.renderer
  );
}

