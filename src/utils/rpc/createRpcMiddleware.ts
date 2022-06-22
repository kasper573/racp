import { Router, Request, RequestHandler } from "express";
import * as bodyParser from "body-parser";
import { typedKeys } from "../typedKeys";
import { RpcDefinition, RpcDefinitions } from "./createRpcDefinitions";
import { RpcHandler, RpcHandlers } from "./createRpcHandlers";
import { createEndpointUrl } from "./createRpcEndpoints";
import { RpcException } from "./RpcException";

export function createRpcMiddlewareFactory(
  isAuthenticated: (req: Request) => boolean
) {
  function factory<
    Definitions extends RpcDefinitions,
    Handlers extends RpcHandlers<Definitions>
  >(definitions: Definitions, handlers: Handlers): RequestHandler {
    const router = Router();
    router.use(bodyParser.text({ type: "*/*" }));
    for (const endpointName of typedKeys(definitions)) {
      const definition = definitions[endpointName];
      const handler = handlers[endpointName] as RpcHandler<typeof definition>;
      registerRoute(String(endpointName), definition, handler);
    }
    return router;

    function registerRoute<Definition extends RpcDefinition>(
      endpointName: string,
      definition: Definition,
      handler: RpcHandler<Definition>
    ) {
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

          let handlerResult: ReturnType<typeof handler>;
          try {
            handlerResult = handler(argument.data);
          } catch (e) {
            if (e instanceof RpcException) {
              log(`Handler exited due to a known exception: ${e.message} `);
              return response
                .status(httpStatus.internalServerError)
                .send(e.message);
            }
            log(`Unexpected error while expecting handler`, e);
            return response.sendStatus(httpStatus.internalServerError);
          }

          const result = definition.result.safeParse(handlerResult);
          if (!result.success) {
            log("Return value had wrong data type", {
              result,
              expected: definition.result,
            });
            return response.sendStatus(httpStatus.internalServerError);
          }
          response.json(result.data);
        }
      );
    }
  }
  return factory;
}

const httpStatus = {
  badRequest: 400,
  methodNotAllowed: 405,
  notAcceptable: 406,
  internalServerError: 500,
};
