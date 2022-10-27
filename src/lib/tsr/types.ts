import * as zod from "zod";
import { ZodOptionalType, ZodRawShape, ZodType, ZodTypeAny } from "zod";
import { TSRDefinition } from "./tsr";
import { PathParams } from "./PathParams";

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

export type RouteMap<TSRDef extends TSRDefinition = TSRDefinition> = Record<
  string,
  AnyRouteLike<TSRDef>
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

export type AnyRouteLike<T extends Route | RouteDefinition | TSRDefinition> =
  Route<RouteDefinition<T extends TSRDefinition ? T : TSRDefinitionFor<T>>>;

export type TSRDefinitionFor<T> = T extends RouteDefinition
  ? T["tsr"]
  : T extends Route
  ? T["def"]["tsr"]
  : never;

export interface RouteLocationFactory<Params extends RouteParamsType> {
  (params: InferRouteParams<Params>): RouterLocation;
}

type IsOptional<T> = undefined extends T ? true : false;

export type InferRouteParams<T extends RouteParamsType> = zod.objectOutputType<
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
  encode: <T extends Base>(value: zod.infer<T>, type: T) => string | undefined;
  decode: <T extends Base>(encoded: string, type: T) => zod.infer<T>;
}
