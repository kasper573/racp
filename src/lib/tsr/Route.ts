import * as zod from "zod";
import { ZodRawShape, ZodTypeAny } from "zod";
import { TSRDefinition } from "./tsr";

export class RouteBuilderMethods<Def extends RouteDefinition = any> {
  readonly definition: Readonly<Def>;

  constructor(definition: Def) {
    this.definition = definition;
  }

  path<Path extends string>(path: Path) {
    return new Route({ ...this.definition, path } as RouteDefinition<
      Def["tsr"],
      Path,
      Def["params"],
      Def["children"]
    >);
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
  [K in PathParamNames<Path>]: ZodTypeAny;
};

export type PathParamNames<Path extends string> = keyof PathParams<Path>;

export type PathParams<Path extends string> = string extends Path
  ? Record<string, string>
  : Path extends `${infer Start}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof PathParams<Rest>]: string }
  : Path extends `${infer Start}:${infer Param}`
  ? { [k in Param]: string }
  : {};

export type InferRouteParams<T extends RouteParamsType> = zod.objectOutputType<
  T,
  ZodTypeAny
>;
