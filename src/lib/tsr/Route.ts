import * as zod from "zod";
import { ZodRawShape, ZodTypeAny } from "zod";
import { TSRDefinition } from "./tsr";

export function createRoute<Def extends RouteDefinition = any>(
  def: Def
): Route<Def> {
  throw new Error("Not implemented");
}

export interface Route<Def extends RouteDefinition = any>
  extends RouteBuilderMethods<Def> {
  url: (params: InferRouteParams<Def["params"]>) => RouteUrl;
  render: Def["renderer"];
}

export interface RouteBuilderMethods<Def extends RouteDefinition = any> {
  path<Path extends string>(
    path: Path
  ): Route<RouteDefinition<Def["tsr"], Path, Def["params"], Def["children"]>>;

  params<ParamsType extends RouteParamsType>(
    params: ParamsType
  ): Route<
    RouteDefinition<Def["tsr"], Def["path"], ParamsType, Def["children"]>
  >;

  meta(meta: Def["meta"]): Route<Def>;

  renderer: (renderer: Def["renderer"]) => Route<Def>;

  children<Children extends RouteMap<Def["tsr"]>>(
    children: Children
  ): Route<RouteDefinition<Def["tsr"], Def["path"], Def["params"], Children>>;
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
