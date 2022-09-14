import { useRef } from "react";

export interface SchedulerHookOptions {
  maxConcurrent?: number;
  defaultPriority?: () => number;
}

export interface SchedulerCallOptions {
  priority?: number;
}

export function useScheduler({
  maxConcurrent = 20,
  defaultPriority = () => 0,
}: SchedulerHookOptions = {}) {
  const jobs = useRef<Job[]>([]);
  const active = useRef(0);

  function resetScheduler() {
    jobs.current = [];
    active.current = 0;
  }

  function trySpawn() {
    if (active.current < maxConcurrent) {
      const job = jobs.current.shift();
      if (job) {
        spawn(job);
      }
    }
  }

  async function spawn<T>(job: Job<T>) {
    let result: T;
    try {
      active.current++;
      result = await job.run();
    } catch (e) {
      job.reject(e);
      return;
    } finally {
      active.current--;
      trySpawn();
    }
    job.resolve(result);
  }

  function schedule<T>(
    fn: () => Promise<T>,
    { priority = defaultPriority() }: SchedulerCallOptions = {}
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      jobs.current.push({ run: fn, resolve, reject, priority });
      jobs.current.sort((a, b) => a.priority - b.priority);
      trySpawn();
    });
  }

  return [schedule, resetScheduler] as const;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Job<T = any> {
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  priority: number;
}
