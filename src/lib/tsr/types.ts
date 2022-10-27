import * as zod from "zod";
import { ZodOptionalType, ZodRawShape, ZodType, ZodTypeAny } from "zod";
import { TSRDefinition } from "./tsr";
import { PathParams } from "./PathParams";
import { Route } from "./Route";

export type RouteLocation = "NominalString<RouterLocation>";

export interface RouteDefinition<
  TSRDef extends TSRDefinition = TSRDefinition,
  Path extends string = any,
  ParamsType extends RouteParamsTypeFor<Path> = any,
  Children extends RouteMap<TSRDef> = any
> {
  tsr: TSRDef;
  path: Path;
  params: ParamsType;
  meta: TSRDef["meta"];
  renderer: RouteRenderer<ParamsType, TSRDef["renderResult"]>;
  children: Children;
  middlewares: Array<RouteMiddleware<ParamsType, TSRDef["renderResult"]>>;
  matchOptions?: RouteMatchOptions;
}

export type RouteMiddleware<
  ParamsType extends RouteParamsType = any,
  RenderResult = any
> = (
  nextRenderer: RouteRenderer<ParamsType, RenderResult>
) => RouteRenderer<ParamsType, RenderResult>;

export interface RouteRendererProps<Params, RenderResult> {
  params: Params;
  children?: RenderResult;
}

export type RouteRenderer<ParamsType extends RouteParamsType, RenderResult> = (
  props: RouteRendererProps<OutputRouteParams<ParamsType>, RenderResult>
) => RenderResult;

export type RouteMap<TSRDef extends TSRDefinition = TSRDefinition> = Record<
  string,
  AnyRouteLike<TSRDef>
>;

export type RouteParams<T extends Route | RouteDefinition> = InputRouteParams<
  (T extends Route<infer Def> ? Def : T)["params"]
>;

export type RouteParamsType = ZodRawShape;

export type RouteParamsTypeFor<Path extends string> = {
  [K in keyof PathParams<Path>]: IsOptional<PathParams<Path>[K]> extends true
    ? ZodOptionalType<any>
    : ZodTypeAny;
};

export type AnyRouteLike<T extends Route | RouteDefinition | TSRDefinition> =
  Route<RouteDefinition<T extends TSRDefinition ? T : TSRDefinitionFor<T>>>;

export type TSRDefinitionFor<T> = T extends RouteDefinition
  ? T["tsr"]
  : T extends Route
  ? T["def"]["tsr"]
  : never;

export interface RouteLocationFactory<Params extends RouteParamsType> {
  (params: InputRouteParams<Params>): RouteLocation;
}

type IsOptional<T> = undefined extends T ? true : false;

export type InputRouteParams<T extends RouteParamsType> = zod.objectInputType<
  T,
  ZodTypeAny
>;

export type OutputRouteParams<T extends RouteParamsType> = zod.objectOutputType<
  T,
  ZodTypeAny
>;

export type RouteMatchOptions = {
  strict?: boolean;
  exact?: boolean;
};

export interface RouteMatch<R extends Route = Route> {
  route: R;
  params: RouteParams<R>;
}

export interface ParamCodec<Base extends ZodType = ZodTypeAny> {
  encode: <T extends Base>(value: zod.input<T>, type: T) => string | undefined;
  decode: <T extends Base>(encoded: string, type: T) => zod.output<T>;
}
