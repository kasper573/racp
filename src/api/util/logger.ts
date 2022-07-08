import { WriteStream } from "tty";

export interface Logger {
  log: LogFn;
  wrap: <Fn extends AnyFn>(fn: Fn) => Fn;
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
    wrap(fn) {
      function wrapped(...args: unknown[]) {
        const functionCallId = `${fn.name}(${stringifyArgs(args)})`;

        const startTime = Date.now();
        const result = fn(...args);
        if (result instanceof Promise) {
          result.then(onFunctionFinished);
        } else {
          onFunctionFinished();
        }

        function onFunctionFinished() {
          const delta = Date.now() - startTime;
          log(`(${delta}ms)`, functionCallId);
        }

        return result;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return wrapped as any;
    },
  };
}

export function createEllipsisLogFn(writeStream: WriteStream): LogFn {
  return (...args) =>
    writeStream.write(ellipsis(args.join(" "), writeStream.columns) + "\n");
}

function createNamedLogFn(logFn: LogFn, name: string): LogFn {
  return (...args) => logFn(`[${name}]`, ...args);
}

function stringifyArgs(args: unknown[]) {
  return args
    .map((arg) =>
      typeof arg === "number" ? arg : `"${arg}"`.replaceAll(/[\r\n]/g, "")
    )
    .join(", ");
}

function ellipsis(str: string, max: number) {
  return str.length > max ? str.substring(0, max - 3) + "..." : str;
}
