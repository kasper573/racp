import { isPlainObject } from "lodash";

const colorWrap = (codes: AnsiColors, args: unknown[]) => [
  ...codes.map((code) => `\x1b[${code}m`),
  ...args,
  "\x1b[0m", // Reset attributes
];

export function createLogger(
  logFn: LogFn,
  options: LoggerOptions = {}
): Logger {
  const { name, timeColor, errorColor = [31], warnColor = [33] } = options;
  const log = name ? createNamedLogFn(logFn, name) : logFn;
  const chain = (name: string) => createLogger(log, { ...options, name });
  const error: LogFn = (...args) => log(...colorWrap(errorColor, args));
  const warn: LogFn = (...args) => log(...colorWrap(warnColor, args));

  function track<T>(promise: Promise<T>, name: string, ...args: unknown[]) {
    const startTime = Date.now();
    return promise.then((value) => {
      log(createFunctionLog(name, args, value, startTime, timeColor));
      return value;
    });
  }

  return {
    log,
    error,
    warn,
    chain,
    track,
    wrap(fn, name = fn.name, emitArgs) {
      function wrapped(...args: unknown[]) {
        (emitArgs as any)?.(...args);

        const startTime = Date.now();
        const result = fn(...args);
        if (result instanceof Promise) {
          return track(result, name, ...args);
        } else {
          log(createFunctionLog(name, args, result, startTime, timeColor));
          return result;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return wrapped as any;
    },
  };
}

function createNamedLogFn(logFn: LogFn, name: string): LogFn {
  return (...args) => logFn(`[${name}]`, ...args);
}

function createFunctionLog(
  name: string,
  args: unknown[],
  result: unknown,
  startTime: number,
  getTimeColor?: TimeColorResolver
) {
  const timeSpent = Date.now() - startTime;
  let timeString = `${timeSpent}ms`;
  let timeColor = getTimeColor?.(timeSpent);
  if (timeColor !== undefined) {
    timeString = colorWrap(timeColor, [timeString]).join("");
  }
  const call = name ? `${name}(${stringifyArgs(args)})` : "";
  return [`(${timeString})`, call, "->", stringifyResult(result)]
    .filter(Boolean)
    .join(" ");
}

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

type AnsiColors = number[];

export type TimeColorResolver = (ms: number) => AnsiColors | undefined;

export interface LoggerOptions {
  name?: string;
  timeColor?: TimeColorResolver;
  errorColor?: AnsiColors;
  warnColor?: AnsiColors;
}

export interface Logger {
  log: LogFn;
  warn: LogFn;
  error: LogFn;
  wrap: <Fn extends AnyFn>(
    fn: Fn,
    functionName?: string,
    emitArgs?: (...args: Parameters<Fn>) => void
  ) => Fn;
  track: <T>(
    promise: Promise<T>,
    name: string,
    ...args: unknown[]
  ) => Promise<T>;
  chain: (name: string) => Logger;
}

export type LogFn = (...args: unknown[]) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;
