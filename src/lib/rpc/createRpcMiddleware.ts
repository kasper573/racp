import { Router, Request, RequestHandler } from "express";
import * as bodyParser from "body-parser";
import { typedKeys } from "../typedKeys";
import {
  RpcDefinitionEntry,
  RpcDefinitionEntries,
  RpcDefinitionFor,
} from "./createRpcDefinition";
import { RpcHandler, RpcController } from "./createRpcController";
import { createEndpointUrl } from "./createRpcEndpoints";
import { RpcException } from "./RpcException";

export interface RpcMiddlewareOptions {
  requestBodySizeLimit?: number;
  log?: (...args: unknown[]) => void;
}

export function createRpcMiddlewareFactory<Auth>(
  validatorFor: (requiredAuth: Auth) => (req: Request) => boolean,
  { log, requestBodySizeLimit }: RpcMiddlewareOptions
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
    router.use(bodyParser.text({ type: "*/*", limit: requestBodySizeLimit }));
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
      function logRoute(...args: unknown[]) {
        log?.(`[${String(endpointName)}] `, ...args);
      }

      const isAuthorized = validatorFor(entry.auth);

      router.post(
        `/${createEndpointUrl(endpointName)}`,
        // Authentication funnel
        (req, res, next) => {
          if (!isAuthorized(req)) {
            logRoute("Permission denied");
            return res.sendStatus(401);
          }
          return next();
        },
        // RPC execution
        async (request, response) => {
          let parsedBody: unknown;
          try {
            parsedBody =
              request.body.length > 0 ? JSON.parse(request.body) : undefined;
          } catch {
            logRoute(
              `Could not parse request body as JSON. Received: `,
              request.body
            );
            return response.sendStatus(httpStatus.badRequest);
          }

          const argument = entry.argument.safeParse(parsedBody);
          if (!argument.success) {
            logRoute(`Invalid argument type, ${argument.error.message}`);
            return response.sendStatus(httpStatus.badRequest);
          }

          const handler = await handlerPromise;
          let rpcResult: PromiseResult<ReturnType<typeof handler>>;
          try {
            rpcResult = await handler(argument.data);
          } catch (e) {
            if (e instanceof RpcException) {
              logRoute(
                `Handler exited due to a known exception: ${e.message} `
              );
              return response
                .status(httpStatus.internalServerError)
                .send(e.message);
            }
            logRoute(`Unexpected error while executing handler`, e);
            return response.sendStatus(httpStatus.internalServerError);
          }

          const parsedRpcResult = entry.result.safeParse(rpcResult);
          if (!parsedRpcResult.success) {
            logRoute(
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
