import { createRenderer } from "./Renderer";
import { createRoute, RouteMap, RouteDefinition } from "./Route";
import { createRouter } from "./Router";

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

  readonly route = createRoute(this.routeTemplate);

  router<Graph extends RouteMap<RouteTemplate["tsr"]>>(graph: Graph) {
    return createRouter(this.route.children(graph));
  }

  readonly renderer = createRenderer<RouteTemplate["tsr"]>();
}

export interface TSRDefinition<Meta = any, RenderResult = any> {
  meta: Meta;
  renderResult: RenderResult;
}
