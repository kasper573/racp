import { ReactElement } from "react";
import { TSRDefinition } from "../tsr";
import { RouteDefinition, Router, RouteRendererProps } from "../types";

export type ReactRenderResult = ReactElement | null;

export type ReactRouter = Router<
  RouteDefinition<TSRDefinition<any, ReactRenderResult>>
>;

export type RouteComponentProps<Params> = RouteRendererProps<
  Params,
  ReactRenderResult
>;
