import * as morgan from "morgan";
import { Logger } from "./logger";

export function loggerToMorgan(logger: Logger) {
  return morgan(
    (tokens, req, res) =>
      [
        tokens.method(req, res),
        decodeURIComponent(tokens.url(req, res) ?? ""),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
      ].join(" "),
    { stream: { write: (str) => logger.log(str.trim()) } }
  );
}
