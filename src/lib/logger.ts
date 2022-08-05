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
        const functionCallId = `${functionName}(${stringifyArgs(args)})`;

        const startTime = Date.now();
        const result = fn(...args);
        if (result instanceof Promise) {
          result.then(onFunctionFinished);
        } else {
          onFunctionFinished(result);
        }

        function onFunctionFinished(result: unknown) {
          const delta = Date.now() - startTime;
          log(`(${delta}ms)`, functionCallId, stringifyResult(result));
        }

        return result;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return wrapped as any;
    },
  };
}

function createNamedLogFn(logFn: LogFn, name: string): LogFn {
  return (...args) => logFn(`[${name}]`, ...args);
}

function stringifyArgs(args: unknown[]) {
  return (
    args
      .filter(Boolean)
      .map((arg) =>
        typeof arg === "number"
          ? `${arg}`
          : JSON.stringify(arg).replaceAll(/[\r\n]/g, "")
      )[0] ?? ""
  );
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
