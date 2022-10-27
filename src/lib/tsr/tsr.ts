import { createRouter } from "./Router";
import { Route } from "./Route";
import { createDefaultParamCodec } from "./utils/createDefaultParamCodec";
import {
  ParamCodec,
  RouteDefinition,
  RouteMap,
  RouteMiddleware,
} from "./types";

export class TSRBuilder<TSRDef extends TSRDefinition> {
  private definition = {
    meta: undefined as TSRDef["meta"],
    renderResult: undefined as TSRDef["renderResult"],
    codec: createDefaultParamCodec(),
    separator: "/",
  } as unknown as TSRDef;

  meta<Meta>(): TSRBuilder<TSRDefinition<Meta, TSRDef["renderResult"]>> {
    return this;
  }

  renders<RenderResult>(): TSRBuilder<
    TSRDefinition<TSRDef["meta"], RenderResult>
  > {
    return this;
  }

  codec(codec: ParamCodec) {
    this.definition.codec = codec;
    return this;
  }

  build<RouteTemplate extends Omit<RouteDefinition<TSRDef>, "tsr">>(
    template: RouteTemplate
  ) {
    return new TSR({ ...template, tsr: this.definition });
  }
}

export class TSR<RouteTemplate extends RouteDefinition = any> {
  constructor(private routeTemplate: RouteTemplate) {}

  readonly route = new Route(this.routeTemplate);

  router<Graph extends RouteMap<RouteTemplate["tsr"]>>(graph: Graph) {
    return createRouter(this.route.children(graph));
  }

  middleware(fn: RouteMiddleware<any, RouteTemplate["tsr"]["renderResult"]>) {
    return fn;
  }
}

export interface TSRDefinition<Meta = any, RenderResult = any> {
  meta: Meta;
  renderResult: RenderResult;
  codec: ParamCodec;
  separator: string;
}
