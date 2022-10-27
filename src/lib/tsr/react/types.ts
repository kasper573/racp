import { ReactElement } from "react";
import { TSRDefinition } from "../tsr";
import { RouteDefinition, RouteRendererProps } from "../types";
import { Router } from "../Router";
import { Route } from "../Route";

export type ReactRenderResult = ReactElement | null;

export type ReactRouter = Router<
  Route<RouteDefinition<TSRDefinition<any, ReactRenderResult>>>
>;

export type RouteComponentProps<Params> = RouteRendererProps<
  Params,
  ReactRenderResult
>;
