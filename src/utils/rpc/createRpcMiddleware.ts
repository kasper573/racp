import { Router, Request, RequestHandler } from "express";
import * as bodyParser from "body-parser";
import { typedKeys } from "../typedKeys";
import {
  RpcDefinitionEntry,
  RpcDefinitionEntries,
} from "./createRpcDefinition";
import { RpcHandler, RpcHandlers } from "./createRpcHandlers";
import { createEndpointUrl } from "./createRpcEndpoints";
import { RpcException } from "./RpcException";

export function createRpcMiddlewareFactory(
  isAuthenticated: (req: Request) => boolean
) {
  function factory<
    Entries extends RpcDefinitionEntries,
    Handlers extends RpcHandlers<Entries>
  >(entries: Entries, handlers: Handlers): RequestHandler {
    const router = Router();
    router.use(bodyParser.text({ type: "*/*" }));
    for (const endpointName of typedKeys(entries)) {
      const entry = entries[endpointName];
      const handler = handlers[endpointName] as RpcHandler<typeof entry>;
      registerRoute(String(endpointName), entry, handler);
    }
    return router;

    function registerRoute<Entry extends RpcDefinitionEntry>(
      endpointName: string,
      entry: Entry,
      handler: RpcHandler<Entry>
    ) {
      function log(...args: unknown[]) {
        console.log(`[RPC] [${String(endpointName)}] `, ...args);
      }

      router.post(
        `/${createEndpointUrl(endpointName)}`,
        // Authentication funnel
        (req, res, next) => {
          if (entry.auth && !isAuthenticated(req)) {
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

          const argument = entry.argument.safeParse(parsedBody);
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

          const result = entry.result.safeParse(handlerResult);
          if (!result.success) {
            log("Return value had wrong data type", {
              result,
              expected: entry.result,
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
