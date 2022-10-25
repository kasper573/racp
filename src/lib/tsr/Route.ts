import * as zod from "zod";
import { ZodOptionalType, ZodRawShape, ZodTypeAny } from "zod";
import { TSRDefinition } from "./tsr";
import { PathParams } from "./PathParams";

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
  readonly render: Def["renderer"] = this.definition.renderer;
}

export type RouteUrl = "NominalString<RouteUrl>";

export interface RouteDefinition<
  TSRDef extends TSRDefinition = any,
  Path extends string = any,
  ParamsType extends RouteParamsTypeFor<Path> = any,
  Children extends RouteMap<TSRDef> = any
> {
  tsr: TSRDef;
  path: Path;
  params: ParamsType;
  meta: TSRDef["meta"];
  renderer: RouteRenderer<InferRouteParams<ParamsType>, TSRDef["renderResult"]>;
  children: Children;
  matchOptions?: RouteMatchOptions;
}

export type RouteRenderer<Params, RenderResult> = (props: {
  params: Params;
  children?: RenderResult;
}) => RenderResult;

export type RouteMap<TSRDef extends TSRDefinition = any> = Record<
  string,
  Route<RouteDefinition<TSRDef>>
>;

export type RouteParams<T extends Route> = InferRouteParams<
  T extends Route<infer Def> ? Def["params"] : never
>;

export type RouteParamsType = ZodRawShape;

export type RouteParamsTypeFor<Path extends string> = {
  [K in keyof PathParams<Path>]: IsOptional<PathParams<Path>[K]> extends true
    ? ZodOptionalType<any>
    : ZodTypeAny;
};

type IsOptional<T> = undefined extends T ? true : false;

export type InferRouteParams<T extends RouteParamsType> = zod.objectOutputType<
  T,
  ZodTypeAny
>;

export type RouteMatchOptions = {
  strict?: boolean;
  exact?: boolean;
};
