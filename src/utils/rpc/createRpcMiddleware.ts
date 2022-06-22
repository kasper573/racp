import { Router, Request, RequestHandler } from "express";
import * as bodyParser from "body-parser";
import { typedKeys } from "../typedKeys";
import { RpcDefinitions } from "./createRpcDefinitions";
import { RpcHandlers } from "./createRpcHandlers";
import { createEndpointUrl } from "./createRpcEndpoints";

export function createRpcMiddleware<
  Definitions extends RpcDefinitions,
  Handlers extends RpcHandlers<Definitions>
>(
  definitions: Definitions,
  handlers: Handlers,
  isAuthenticated: (req: Request) => boolean
): RequestHandler {
  const router = Router();
  router.use(bodyParser.text({ type: "*/*" }));
  typedKeys(definitions).forEach((endpointName) => {
    const definition = definitions[endpointName];
    const handler = handlers[endpointName];

    function log(...args: unknown[]) {
      console.log(`[RPC] [${String(endpointName)}] `, ...args);
    }

    router.post(
      `/${createEndpointUrl(endpointName)}`,
      // Authentication funnel
      (req, res, next) => {
        if (definition.auth && !isAuthenticated(req)) {
          log("Permission denied");
          return res.sendStatus(401);
        }
        return next();
      },
      // RPC execution
      (request, response) => {
        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(request.body);
        } catch {
          log(`Could not parse request body as JSON`, { body: request.body });
          return response.sendStatus(httpStatus.badRequest);
        }

        const argument = definition.argument.safeParse(parsedBody);
        if (!argument.success) {
          log(`Invalid argument type, ${argument.error.message}`);
          return response.sendStatus(httpStatus.badRequest);
        }

        let handlerResult: unknown;
        try {
          handlerResult = handler(argument.data);
        } catch (e) {
          log(`Error executing handler`, e);
          return response.sendStatus(httpStatus.internalServerError);
        }

        const result = definition.result.safeParse(handlerResult);
        if (!result.success) {
          log("Return value has wrong data type", {
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
