import * as zod from "zod";
import { Router, Request, Response, RequestHandler } from "express";
import * as bodyParser from "body-parser";
import fileUpload = require("express-fileupload");
import { FileArray, UploadedFile } from "express-fileupload";
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

export interface RpcMiddlewareOptions<Auth, Context> {
  validatorFor: (requiredAuth: Auth) => (req: Request) => boolean;
  logger: Logger;
  getContext: (request: Request) => Context;
}

export function createRpcMiddlewareFactory<Auth, Context>({
  validatorFor,
  logger,
  getContext,
}: RpcMiddlewareOptions<Auth, Context>) {
  function factory<
    Entries extends RpcDefinitionEntries,
    Controller extends RpcController<Entries, Context>
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
        (controller) =>
          controller[endpointName] as RpcHandler<typeof entry, Context>
      );
      registerRoute(String(endpointName), entry, handlerPromise);
    }

    return router;

    function registerRoute<Entry extends RpcDefinitionEntry>(
      endpointName: string,
      entry: Entry,
      handlerPromise: Promise<RpcHandler<Entry, Context>>
    ) {
      const routeLogger = logger.chain(endpointName);
      const isAuthorized = validatorFor(entry.auth);

      const handlers: RequestHandler[] = [];

      // Authentication funnel
      handlers.push((req, res, next) => {
        if (!isAuthorized(req)) {
          routeLogger.warn("Permission denied");
          return res.sendStatus(401);
        }
        return next();
      });

      if (entry.intent === "fileUpload") {
        handlers.push(
          fileUpload({ limits: { fileSize: entry.requestBodySizeLimit } }),
          (request, response) =>
            handleArgument(
              request.files ? flattenFiles(request.files) : [],
              request,
              response
            )
        );
      } else {
        handlers.push(
          bodyParser.text({
            type: "*/*",
            limit: entry.requestBodySizeLimit,
          }),
          async (request, response) => {
            let parsedBody: unknown;
            try {
              parsedBody =
                request.body.length > 0 ? JSON.parse(request.body) : undefined;
            } catch {
              routeLogger.error(
                `Could not parse request body as JSON. Received: `,
                request.body
              );
              return response.sendStatus(httpStatus.badRequest);
            }

            const argument = entry.argument.safeParse(parsedBody);
            if (!argument.success) {
              routeLogger.error(
                `Invalid argument type, ${argument.error.message}`
              );
              return response.sendStatus(httpStatus.badRequest);
            }

            await handleArgument(argument.data, request, response);
          }
        );
      }

      router.post(`/${createEndpointUrl(endpointName)}`, ...handlers);

      async function handleArgument(
        argument: zod.infer<Entry["argument"]>,
        request: Request,
        response: Response
      ) {
        const handler = await handlerPromise;
        const handlerWithLogging = routeLogger.wrap(handler, "handler");

        let rpcResult: PromiseResult<ReturnType<typeof handler>>;
        try {
          rpcResult = await handlerWithLogging(argument, getContext(request));
        } catch (e) {
          if (e instanceof RpcException) {
            routeLogger.warn(
              `Handler exited due to a known exception: ${e.message} `
            );
            return response
              .status(httpStatus.internalServerError)
              .send(e.message);
          }
          routeLogger.error(`Unexpected error while executing handler:`, e);
          return response.sendStatus(httpStatus.internalServerError);
        }

        const parsedRpcResult = entry.result.safeParse(rpcResult);
        if (!parsedRpcResult.success) {
          routeLogger.error(
            "Return value had wrong data type: ",
            parsedRpcResult.error
          );
          return response.sendStatus(httpStatus.internalServerError);
        }
        response.json(parsedRpcResult.data);
      }
    }
  }
  return factory;
}

function flattenFiles(files: FileArray): UploadedFile[] {
  return Object.values(files).reduce(
    (flattened: UploadedFile[], fileOrList) => [
      ...flattened,
      ...(Array.isArray(fileOrList) ? fileOrList : [fileOrList]),
    ],
    []
  );
}

type PromiseResult<T> = T extends PromiseLike<infer V> ? V : never;

const httpStatus = {
  badRequest: 400,
  methodNotAllowed: 405,
  notAcceptable: 406,
  internalServerError: 500,
};
