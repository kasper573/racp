import { isPlainObject } from "lodash";
import { LogFns, LoggerFormattingOptions } from "../../lib/logger";
import { AnsiColor, getTimeColor } from "./timeColor";

export const coloredConsole: LogFns = {
  log: console.log,
  warn: (...args: unknown[]) => console.warn(...colorWrap([33], args)),
  error: (...args: unknown[]) => console.error(...colorWrap([31], args)),
};

export const logFormat = ({
  name,
  args,
  result,
  startTime,
  endTime,
}: LoggerFormattingOptions) => {
  const timeSpent = endTime - startTime;
  let timeString = `${timeSpent}ms`;
  let timeColor = getTimeColor(timeSpent);
  if (timeColor !== undefined) {
    timeString = colorWrap(timeColor, [timeString]).join("");
  }
  const call = name ? `${name}(${stringifyArgs(args)})` : "";
  return [`(${timeString})`, call, "->", stringifyResult(result)]
    .filter(Boolean)
    .join(" ");
};

const colorWrap = (codes: AnsiColor[], args: unknown[]) => [
  ...codes.map((code) => `\x1b[${code}m`),
  ...args,
  "\x1b[0m", // Reset attributes
];

function stringifyArgs(args: unknown[]) {
  return (
    args
      .filter(Boolean)
      .map((arg) =>
        typeof arg === "number"
          ? `${arg}`
          : JSON.stringify(arg, simplifyComplexObjects).replaceAll(
              /[\r\n]/g,
              ""
            )
      )[0] ?? ""
  );
}

function stringifyResult(result: unknown) {
  const quantity = quantify(result);
  if (quantity !== undefined) {
    return `${quantity}`;
  } else {
    return `${typeof result}`;
  }
}

function simplifyComplexObjects(key: string, value: unknown) {
  if (Array.isArray(value)) {
    return value.slice(0, 3).concat("...");
  }
  if (value && typeof value === "object" && !isPlainObject(value)) {
    return value.constructor.name;
  }
  return value;
}

function quantify(value: unknown) {
  if (value === undefined || value === null) {
    return;
  }
  if (Array.isArray(value)) {
    return `Array[${value.length}]`;
  }
  if (value instanceof Map) {
    return `Map[${value.size}]`;
  }
  switch (typeof value) {
    case "number":
    case "bigint":
    case "boolean":
      return value;
  }
}
