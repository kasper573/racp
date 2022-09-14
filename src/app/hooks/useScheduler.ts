import { useRef } from "react";

export function useScheduler(maxConcurrent = 20) {
  const jobs = useRef<Job[]>([]);
  const active = useRef(0);

  function resetScheduler() {
    jobs.current = [];
    active.current = 0;
  }

  function trySpawn() {
    if (active.current < maxConcurrent) {
      const randomIndex = Math.floor(Math.random() * jobs.current.length);
      const job = jobs.current.splice(randomIndex, 1)[0];
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

  function schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      jobs.current.push({ run: fn, resolve, reject });
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
}
