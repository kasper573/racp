import { ReactElement } from "react";
import { TSRDefinition } from "../tsr";
import { AnyRouteLike, RouteRendererProps } from "../types";
import { Router } from "../Router";

export type ReactRenderResult = ReactElement | null;

export type ReactRouter = Router<
  AnyRouteLike<TSRDefinition<ReactRenderResult>>
>;

export type RouteComponentProps<Params> = RouteRendererProps<
  Params,
  ReactRenderResult
>;
