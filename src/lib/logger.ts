import { isPlainObject } from "lodash";

export interface Logger {
  log: LogFn;
  wrap: <Fn extends AnyFn>(fn: Fn, functionName?: string) => Fn;
  chain: (name: string) => Logger;
}

export type LogFn = (...args: unknown[]) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;

export function createLogger(logFn: LogFn, name?: string): Logger {
  const log = name ? createNamedLogFn(logFn, name) : logFn;
  const chain = (name: string) => createLogger(log, name);

  return {
    log,
    chain,
    wrap(fn, functionName = fn.name) {
      function wrapped(...args: unknown[]) {
        const logFunction = createFunctionLogger(functionName, args, log);
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.then((value) => {
            logFunction(value);
            return value;
          });
        } else {
          logFunction(result);
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
  const functionCallId = `${functionName}(${stringifyArgs(args)})`;
  const startTime = Date.now();
  const delta = Date.now() - startTime;
  return (result: unknown) =>
    log(`(${delta}ms)`, functionCallId, stringifyResult(result));
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

function simplifyComplexObjects(key: string, value: unknown) {
  if (Array.isArray(value)) {
    return value.slice(0, 3).concat("...");
  }
  if (value && typeof value === "object" && !isPlainObject(value)) {
    return value.constructor.name;
  }
  return value;
}

function stringifyResult(result: unknown) {
  const value = quantify(result);
  if (value !== undefined) {
    return `-> ${value}`;
  }
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
