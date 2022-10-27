import * as zod from "zod";
import { ZodOptionalType, ZodRawShape, ZodType, ZodTypeAny } from "zod";
import { TSRDefinition } from "./tsr";
import { PathParams } from "./PathParams";
import { Route } from "./Route";

export type RouterLocation = "NominalString<RouterLocation>";

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
  renderer: RouteRenderer<InferRouteParams<ParamsType>, TSRDef["renderResult"]>;
  children: Children;
  middlewares: Array<
    RouteMiddleware<InferRouteParams<ParamsType>, TSRDef["renderResult"]>
  >;
  matchOptions?: RouteMatchOptions;
}

export type RouteMiddleware<Params = any, RenderResult = any> = (
  nextRenderer: RouteRenderer<Params, RenderResult>
) => RouteRenderer<Params, RenderResult>;

export interface RouteRendererProps<Params, RenderResult> {
  params: Params;
  children?: RenderResult;
}

export type RouteRenderer<Params, RenderResult> = (
  props: RouteRendererProps<Params, RenderResult>
) => RenderResult;

export type RouteMap<TSRDef extends TSRDefinition = TSRDefinition> = Record<
  string,
  Route<RouteDefinition<TSRDef>>
>;

export type RouteParams<T extends Route | RouteDefinition> = InferRouteParams<
  (T extends Route<infer Def> ? Def : T)["params"]
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
export type Router<RootDef extends RouteDefinition = any> = RouteResolver<
  RootDef,
  {}
>;

export interface RouterMatch<R extends Route = any> {
  breadcrumbs: R[];
  params: RouteParams<R>;
}

export type RouteResolver<
  Def extends RouteDefinition = any,
  InheritedParams extends RouteParamsType = {}
> = RouteResolverMap<Def["children"], Def["params"] & InheritedParams> &
  RouteLocationFactory<Def["params"] & InheritedParams> & {
    meta: Def["meta"];
    match(
      location: string
    ): RouterMatch<Route<RouteDefinition<Def["tsr"]>>> | undefined;
  };

export interface RouteLocationFactory<Params extends RouteParamsType> {
  (params: InferRouteParams<Params>): RouterLocation;
}

export type RouteResolverMap<
  Routes extends RouteMap,
  InheritedParams extends RouteParamsType
> = {
  [K in keyof Routes]: RouteResolver<
    RouteDefinitionFor<Routes[K]>,
    InheritedParams
  >;
};

export interface ParamCodec<Base extends ZodType = ZodTypeAny> {
  encode: <T extends Base>(value: zod.infer<T>, type: T) => string | undefined;
  decode: <T extends Base>(encoded: string, type: T) => zod.infer<T>;
}

type RouteDefinitionFor<T extends Route> = T extends Route<infer Def>
  ? Def
  : never;
