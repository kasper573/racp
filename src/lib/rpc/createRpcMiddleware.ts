import { Router, Request, RequestHandler } from "express";
import * as bodyParser from "body-parser";
import { typedKeys } from "../typedKeys";
import { Logger } from "../logger";
import {
  RpcDefinitionEntry,
  RpcDefinitionEntries,
  RpcDefinitionFor,
} from "./createRpcDefinition";
import { RpcHandler, RpcController } from "./createRpcController";
import { createEndpointUrl } from "./createRpcEndpoints";
import { RpcException } from "./RpcException";

export interface RpcMiddlewareOptions {
  logger: Logger;
}

export function createRpcMiddlewareFactory<Auth>(
  validatorFor: (requiredAuth: Auth) => (req: Request) => boolean,
  { logger }: RpcMiddlewareOptions
) {
  function factory<
    Entries extends RpcDefinitionEntries,
    Controller extends RpcController<Entries>
  >(
    entriesOrDefinition: Entries | RpcDefinitionFor<Entries>,
    controller: Controller | Promise<Controller>
  ): RequestHandler {
    const entries: Entries =
      "entries" in entriesOrDefinition
        ? (entriesOrDefinition.entries as Entries)
        : entriesOrDefinition;

    const controllerPromise =
      controller instanceof Promise ? controller : Promise.resolve(controller);

    const router = Router();

    for (const endpointName of typedKeys(entries)) {
      const entry = entries[endpointName];
      const handlerPromise = controllerPromise.then(
        (controller) => controller[endpointName] as RpcHandler<typeof entry>
      );
      registerRoute(String(endpointName), entry, handlerPromise);
    }

    return router;

    function registerRoute<Entry extends RpcDefinitionEntry>(
      endpointName: string,
      entry: Entry,
      handlerPromise: Promise<RpcHandler<Entry>>
    ) {
      const routeLogger = logger.chain(endpointName);
      const isAuthorized = validatorFor(entry.auth);

      router.post(
        `/${createEndpointUrl(endpointName)}`,
        // Authentication funnel
        (req, res, next) => {
          if (!isAuthorized(req)) {
            routeLogger.log("Permission denied");
            return res.sendStatus(401);
          }
          return next();
        },
        // Request body parsing
        bodyParser.text({
          type: "*/*",
          limit: entry.requestBodySizeLimit,
        }),
        // RPC execution
        async (request, response) => {
          let parsedBody: unknown;
          try {
            parsedBody =
              request.body.length > 0 ? JSON.parse(request.body) : undefined;
          } catch {
            routeLogger.log(
              `Could not parse request body as JSON. Received: `,
              request.body
            );
            return response.sendStatus(httpStatus.badRequest);
          }

          const argument = entry.argument.safeParse(parsedBody);
          if (!argument.success) {
            routeLogger.log(`Invalid argument type, ${argument.error.message}`);
            return response.sendStatus(httpStatus.badRequest);
          }

          const handler = await handlerPromise;
          const handlerWithLogging = routeLogger.wrap(handler, "handler");

          let rpcResult: PromiseResult<ReturnType<typeof handler>>;
          try {
            rpcResult = await handlerWithLogging(argument.data);
          } catch (e) {
            if (e instanceof RpcException) {
              routeLogger.log(
                `Handler exited due to a known exception: ${e.message} `
              );
              return response
                .status(httpStatus.internalServerError)
                .send(e.message);
            }
            routeLogger.log(`Unexpected error while executing handler`, e);
            return response.sendStatus(httpStatus.internalServerError);
          }

          const parsedRpcResult = entry.result.safeParse(rpcResult);
          if (!parsedRpcResult.success) {
            routeLogger.log(
              "Return value had wrong data type",
              parsedRpcResult,
              "expected",
              entry.result
            );
            return response.sendStatus(httpStatus.internalServerError);
          }
          response.json(parsedRpcResult.data);
        }
      );
    }
  }
  return factory;
}

type PromiseResult<T> = T extends PromiseLike<infer V> ? V : never;

const httpStatus = {
  badRequest: 400,
  methodNotAllowed: 405,
  notAcceptable: 406,
  internalServerError: 500,
};
