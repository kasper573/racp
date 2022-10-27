import { ReactElement } from "react";
import { Router } from "../Router";
import { RouteDefinition, RouteRendererProps } from "../Route";
import { TSRDefinition } from "../tsr";

export type ReactRenderResult = ReactElement | null;

export type ReactRouter = Router<
  RouteDefinition<TSRDefinition<any, ReactRenderResult>>
>;

export type RouteComponentProps<Params> = RouteRendererProps<
  Params,
  ReactRenderResult
>;
