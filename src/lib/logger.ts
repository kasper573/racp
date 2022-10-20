export function createLogger(
  output: LogFns | LogFn,
  options: LoggerOptions = {}
): Logger {
  const logFns =
    typeof output === "function"
      ? { log: output, warn: output, error: output }
      : output;

  const {
    name,
    prefix = defaultLogPrefix,
    format = defaultLogFormat,
  } = options;

  const log = name ? prefix(logFns.log, name) : logFns.log;
  const warn = name ? prefix(logFns.warn, name) : logFns.warn;
  const error = name ? prefix(logFns.error, name) : logFns.error;
  const chain = (name: string) => createLogger(logFns, { ...options, name });

  function track<T>(promise: Promise<T>, name: string, ...args: unknown[]) {
    const startTime = Date.now();
    return promise.then((result) => {
      log(format({ name, args, result, startTime, endTime: Date.now() }));
      return result;
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
          log(format({ name, args, result, startTime, endTime: Date.now() }));
          return result;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return wrapped as any;
    },
  };
}

export const defaultLogPrefix =
  (logFn: LogFn, name: string) =>
  (...args: unknown[]) =>
    logFn(`[${name}]`, ...args);

export const defaultLogFormat = ({
  name,
  args,
  result,
  startTime,
  endTime,
}: LoggerFormattingOptions) =>
  `${name}(${args.join(", ")}) -> ${result} in ${endTime - startTime}ms`;

export interface LogFns {
  log: LogFn;
  warn: LogFn;
  error: LogFn;
}

export interface LoggerFormattingOptions {
  name: string;
  args: unknown[];
  result: unknown;
  startTime: number;
  endTime: number;
}

export interface LoggerOptions {
  name?: string;
  format?: (options: LoggerFormattingOptions) => string;
  prefix?: (logFn: LogFn, prefix: string) => LogFn;
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
