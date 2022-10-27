import { ReactElement } from "react";
import { TSRDefinition } from "../tsr";
import { Route, RouteDefinition, RouteRendererProps } from "../types";
import { Router } from "../Router";

export type ReactRenderResult = ReactElement | null;

export type ReactRouter = Router<
  Route<RouteDefinition<TSRDefinition<any, ReactRenderResult>>>
>;

export type RouteComponentProps<Params> = RouteRendererProps<
  Params,
  ReactRenderResult
>;
