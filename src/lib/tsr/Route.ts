import * as zod from "zod";
import { ZodRawShape, ZodTypeAny } from "zod";
import { TSRDefinition } from "./tsr";

export class RouteBuilderMethods<Def extends RouteDefinition = any> {
  constructor(protected definition: Def) {}

  path<Path extends string>(
    path: Path
  ): Route<RouteDefinition<Def["tsr"], Path, Def["params"], Def["children"]>> {
    throw new Error("Not implemented");
  }

  params<ParamsType extends RouteParamsType>(
    params: ParamsType
  ): Route<
    RouteDefinition<Def["tsr"], Def["path"], ParamsType, Def["children"]>
  > {
    throw new Error("Not implemented");
  }

  meta(meta: Def["meta"]): Route<Def> {
    throw new Error("Not implemented");
  }

  renderer(renderer: Def["renderer"]): Route<Def> {
    throw new Error("Not implemented");
  }

  children<Children extends RouteMap<Def["tsr"]>>(
    children: Children
  ): Route<RouteDefinition<Def["tsr"], Def["path"], Def["params"], Children>> {
    throw new Error("Not implemented");
  }
}

export class Route<
  Def extends RouteDefinition = any
> extends RouteBuilderMethods<Def> {
  url(params: InferRouteParams<Def["params"]>): RouteUrl {
    throw new Error("Not implemented");
  }

  readonly render: Def["renderer"] = this.definition.renderer;
}

export type RouteUrl = "NominalString<RouteUrl>";

export interface RouteDefinition<
  TSRDef extends TSRDefinition = any,
  Path extends string = any,
  ParamsType extends RouteParamsType = any,
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

export type InferRouteParams<T extends RouteParamsType> = zod.objectOutputType<
  T,
  ZodTypeAny
>;
