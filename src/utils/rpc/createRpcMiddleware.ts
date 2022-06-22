import { RequestHandler } from "express-serve-static-core";
import { Router } from "express";
import * as bodyParser from "body-parser";
import { typedKeys } from "../typedKeys";
import { tryHandler } from "../tryHandler";
import { RpcDefinitions } from "./createRpcDefinitions";
import { RpcHandlers } from "./createRpcHandlers";
import { createEndpointUrl } from "./createRpcEndpoints";

export function createRpcMiddleware<
  Definitions extends RpcDefinitions,
  Handlers extends RpcHandlers<Definitions>
>(
  definitions: Definitions,
  handlers: Handlers,
  authHandler?: RequestHandler
): RequestHandler {
  const router = Router();
  router.use(bodyParser.text({ type: "*/*" }));
  typedKeys(definitions).forEach((endpointName) => {
    const definition = definitions[endpointName];
    const handler = handlers[endpointName];

    function error(...args: unknown[]) {
      console.error(`[RPC] [${String(endpointName)}] `, ...args);
    }

    router.post(
      `/${createEndpointUrl(endpointName)}`,
      // Authentication funnel
      (req, res, next) => {
        if (!definition.auth) {
          return next();
        }
        if (!authHandler) {
          error("Disabled. Auth required but auth handler not initialized.");
          return res.sendStatus(403);
        }
        if (!tryHandler(authHandler, req, res, next)) {
          error("Authentication failed");
        }
      },
      // RPC execution
      (request, response) => {
        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(request.body);
        } catch {
          error(`Could not parse request body as JSON`, { body: request.body });
          return response.sendStatus(httpStatus.badRequest);
        }

        const argument = definition.argument.safeParse(parsedBody);
        if (!argument.success) {
          error(`Invalid argument type, ${argument.error.message}`);
          return response.sendStatus(httpStatus.badRequest);
        }

        let handlerResult: unknown;
        try {
          handlerResult = handler(argument.data);
        } catch (e) {
          error(`Error executing handler`, e);
          return response.sendStatus(httpStatus.internalServerError);
        }

        const result = definition.result.safeParse(handlerResult);
        if (!result.success) {
          error("Return value has wrong data type", {
            result,
            expected: definition.result,
          });
          return response.sendStatus(httpStatus.internalServerError);
        }
        response.json(result.data);
      }
    );
  });
  return router;
}

const httpStatus = {
  badRequest: 400,
  methodNotAllowed: 405,
  notAcceptable: 406,
  internalServerError: 500,
};
