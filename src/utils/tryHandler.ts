import { RequestHandler } from "express";

export function tryHandler(
  handler: RequestHandler,
  ...[req, res, next]: Parameters<RequestHandler>
) {
  let success = false;
  handler(req, res, () => {
    success = true;
    next();
  });
  return success;
}
