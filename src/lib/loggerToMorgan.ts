import * as morgan from "morgan";
import { Logger } from "./logger";

export function loggerToMorgan(logger: Logger) {
  return morgan(
    (tokens, req, res) => {
      let url = tokens.url(req, res) ?? "";
      try {
        url = decodeURIComponent(url);
      } catch {
        // ignore
      }
      return [
        tokens.method(req, res),
        url,
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ");
    },
    { stream: { write: (str) => logger.log(str.trim()) } }
  );
}
