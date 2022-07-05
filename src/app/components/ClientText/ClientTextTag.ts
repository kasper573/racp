import { ComponentType, ReactNode } from "react";
import { ClientTextNode } from "../../../api/common/clientTextType";

export type ClientTextTag = ComponentType<{
  children?: ReactNode;
  node: ClientTextNode;
}>;
