export interface Logger {
  log: LogFn;
  logProcess: ProcessLogFn;
  chain: (name: string) => Logger;
}

export type LogFn = (...args: unknown[]) => void;

export type ProcessLogFn = <P extends Process>(
  process: P,
  ...logArgs: unknown[]
) => ProcessResult<P>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Process<T = any> = (() => T) | (() => Promise<T>);

export type ProcessResult<T> = T extends Process<infer V> ? V : never;

export function createLogger(logFn: LogFn, name?: string): Logger {
  const log = name ? createNamedLogFn(logFn, name) : logFn;
  return {
    log,
    chain: (name: string) => createLogger(log, name),
    logProcess(process, ...args) {
      log("Process started: ", ...args);
      const startTime = Date.now();
      function end() {
        const delta = Date.now() - startTime;
        log(`Process finished (${delta}ms): `, ...args);
      }
      const result = process();
      if (result instanceof Promise) {
        result.then(end);
      } else {
        end();
      }
      return result;
    },
  };
}

function createNamedLogFn(logFn: LogFn, name: string): LogFn {
  return (...args) => logFn(`[${name}]`, ...args);
}
