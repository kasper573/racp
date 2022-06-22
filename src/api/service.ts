import { apiServiceDefinition } from "../shared/apiServiceDefinition";
import { createRpcHandlers } from "../utils/rpc/createRpcHandlers";

export const apiServiceHandler = createRpcHandlers(apiServiceDefinition, {
  getHello: (n) => [`Hello ${n}`, `World ${n}`],
});
