import { ComponentType } from "react";
import { ClientTextNode } from "../../../api/common/clientTextType";

export type ClientTextTag = ComponentType<{
  node: ClientTextNode;
}>;
