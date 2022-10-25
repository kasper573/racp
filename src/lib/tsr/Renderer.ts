import { TSRDefinition } from "./tsr";
import { RouterMatch } from "./Router";
import { Route, RouteDefinition } from "./Route";

export function createRenderer<
  TSRDef extends TSRDefinition
>(): RouteRenderer<TSRDef> {
  throw new Error("Not implemented");
}

export interface RouteRenderer<TSRDef extends TSRDefinition> {
  render<Matches extends RouterMatch<Route<RouteDefinition<TSRDef>>>[]>(
    matches: Matches
  ): TSRDef["renderResult"];
}
