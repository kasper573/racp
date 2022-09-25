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

  return {
    log,
    error,
    warn,
    chain,
    wrap(fn, functionName = fn.name, emitArgs) {
      function wrapped(...args: unknown[]) {
        const logFunction = createFunctionLogger(
          functionName,
          args,
          log,
          timeColor
        );
        (emitArgs as any)?.(...args);

        const startTime = Date.now();
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.then((value) => {
            logFunction(value, startTime);
            return value;
          });
        } else {
          logFunction(result, startTime);
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

function createFunctionLogger(
  functionName: string,
  args: unknown[],
  log: LogFn,
  timeColor?: TimeColorResolver
) {
  return (result: unknown, startTime: number) =>
    log(
      createFunctionLogPrefix(functionName, args, startTime, timeColor) +
        stringifyResult(result)
    );
}

export function createFunctionLogPrefix(
  functionName: string,
  args: unknown[],
  startTime: number,
  getTimeColor?: TimeColorResolver
) {
  const timeSpent = Date.now() - startTime;
  let timeString = `${timeSpent}ms`;
  let timeColor = getTimeColor?.(timeSpent);
  if (timeColor !== undefined) {
    timeString = colorWrap(timeColor, [timeString]).join("");
  }
  return `(${timeString}) ${functionName}(${stringifyArgs(args)}) -> `;
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
    return value.length;
  }
  if (value instanceof Map) {
    return value.size;
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
  chain: (name: string) => Logger;
}

export type LogFn = (...args: unknown[]) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;
