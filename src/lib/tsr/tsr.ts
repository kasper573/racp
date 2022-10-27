import { createDefaultParamCodec } from "./utils/createDefaultParamCodec";
import {
  ParamCodec,
  RouteDefinition,
  RouteMap,
  RouteMiddleware,
} from "./types";
import { Router } from "./Router";
import { createRoute } from "./Route";

const defaultMeta = {};
const defaultSeparator = "/" as const;

export function createTSR<
  RenderResult = any,
  Meta = typeof defaultMeta,
  Separator extends string = typeof defaultSeparator
>({
  codec = createDefaultParamCodec(),
  separator = defaultSeparator as Separator,
  meta = defaultMeta as Meta,
}: {
  codec?: ParamCodec;
  separator?: Separator;
  meta?: Meta;
} = {}) {
  return new TSR<TSRDefinition<RenderResult, Meta, Separator>>({
    codec,
    separator,
    meta,
  });
}

export class TSR<Def extends TSRDefinition> {
  constructor(
    private options: {
      codec: ParamCodec;
      separator: Def["separator"];
      meta: Def["meta"];
    }
  ) {}

  readonly route = createRoute({
    tsr: {
      codec: this.options.codec,
      separator: this.options.separator,
    } as Def,
    middlewares: [],
    children: {},
    meta: this.options.meta,
    params: {},
    path: "",
  } as RouteDefinition<Def, "", {}, {}>);

  router<Graph extends RouteMap<Def>>(graph: Graph) {
    return new Router(this.route.children(graph));
  }

  middleware(fn: RouteMiddleware<{}, Def["renderResult"]>) {
    return fn;
  }
}

export interface TSRDefinition<
  RenderResult = any,
  Meta = any,
  Separator extends string = any
> {
  meta: Meta;
  renderResult: RenderResult;
  codec: ParamCodec;
  separator: Separator;
}
