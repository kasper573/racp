import { RouteMap, RouteDefinition, RouteMiddleware } from "./Route";
import {
  createRouter,
  RouteParamRecordSerializationProtocol,
  RouteParamSerializationProtocol,
} from "./Router";
import { Route } from "./Route";

export class TSRBuilder<TSRDef extends TSRDefinition> {
  private definition = {
    meta: undefined as TSRDef["meta"],
    renderResult: undefined as TSRDef["renderResult"],
    protocol: new RouteParamRecordSerializationProtocol(JSON),
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

  protocol(protocol: RouteParamSerializationProtocol) {
    this.definition.protocol = new RouteParamRecordSerializationProtocol(
      protocol
    );
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
  protocol: RouteParamRecordSerializationProtocol;
  separator: string;
}
