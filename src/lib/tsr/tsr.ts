import { RouteMap, RouteDefinition, RouteMiddleware } from "./Route";
import { createRouter } from "./Router";
import { Route } from "./Route";

export class TSRBuilder<TSRDef extends TSRDefinition> {
  meta<Meta>(): TSRBuilder<TSRDefinition<Meta, TSRDef["renderResult"]>> {
    return this;
  }

  renderResult<RenderResult>(): TSRBuilder<
    TSRDefinition<TSRDef["meta"], RenderResult>
  > {
    return this;
  }

  build<RouteTemplate extends Omit<RouteDefinition<TSRDef>, "tsr">>(
    template: RouteTemplate
  ) {
    const tsr = {} as TSRDef;
    return new TSR({ ...template, tsr });
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
}
