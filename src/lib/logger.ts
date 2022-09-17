import { isPlainObject } from "lodash";

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

export function createLogger(logFn: LogFn, name?: string): Logger {
  const log = name ? createNamedLogFn(logFn, name) : logFn;
  const chain = (name: string) => createLogger(log, name);
  const error: LogFn = (...args) => log("\x1b[31m", ...args, "\x1b[0m");
  const warn: LogFn = (...args) => log("\x1b[33m", ...args, "\x1b[0m");

  return {
    log,
    error,
    warn,
    chain,
    wrap(fn, functionName = fn.name, emitArgs) {
      function wrapped(...args: unknown[]) {
        const logFunction = createFunctionLogger(functionName, args, log);
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
  log: LogFn
) {
  return (result: unknown, startTime: number) =>
    log(
      createFunctionLogPrefix(functionName, args, startTime) +
        stringifyResult(result)
    );
}

export function createFunctionLogPrefix(
  functionName: string,
  args: unknown[],
  startTime: number
) {
  return `(${Date.now() - startTime}ms) ${functionName}(${stringifyArgs(
    args
  )}) -> `;
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
