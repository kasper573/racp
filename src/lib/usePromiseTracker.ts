import { useEffect, useReducer } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { allResolved } from "./allResolved";
import { useScheduler } from "./useScheduler";

export type TaskError = unknown;

export interface TaskRejection {
  fn: TaskFn;
  error: TaskError;
}

interface Task {
  name: string;
  pending: TaskFn[];
  resolved: TaskFn[];
  rejected: TaskRejection[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskFn<T = any> = () => Promise<T>;

const slice = createSlice({
  name: "promiseTracker",
  initialState: [] as Task[],
  reducers: {
    addTask: (
      tasks,
      { payload: { name, fns } }: PayloadAction<{ name: string; fns: TaskFn[] }>
    ) => {
      const existing = tasks.find((task) => task.name === name);
      if (existing) {
        existing.pending.push(...fns);
      } else {
        tasks.push({ name, pending: fns, resolved: [], rejected: [] });
      }
    },
    resolve: (tasks, { payload: fn }: PayloadAction<TaskFn>) => {
      for (const task of tasks) {
        const index = task.pending.indexOf(fn);
        if (index !== -1) {
          task.pending.splice(index, 1);
          task.resolved.push(fn);
        }
      }
    },
    reject: (tasks, { payload: rejection }: PayloadAction<TaskRejection>) => {
      for (const task of tasks) {
        const index = task.pending.indexOf(rejection.fn);
        if (index !== -1) {
          task.pending.splice(index, 1);
          task.rejected.push(rejection);
        }
      }
    },
    removeAllTasks: (tasks) => {
      tasks.splice(0, tasks.length);
    },
  },
});

export const taskSettled = (task: Task) =>
  task.rejected.length + task.resolved.length;

export const taskTotal = (task: Task) =>
  task.pending.length + task.rejected.length + task.resolved.length;

export const taskProgress = (task: Task) => taskSettled(task) / taskTotal(task);

const { resolve, reject, addTask, removeAllTasks } = slice.actions;

export function usePromiseTracker() {
  const [tasks, dispatch] = useReducer(slice.reducer, slice.getInitialState());
  const [schedule, resetScheduler] = useScheduler();

  useEffect(
    () => () => {
      resetScheduler();
      dispatch(removeAllTasks());
    },
    []
  );

  function track<T>(name: string, fns: TaskFn<T>[]): Promise<T[]> {
    dispatch(addTask({ name, fns }));

    const promises = fns.map((fn) =>
      schedule(async () => {
        try {
          const res = await fn();
          dispatch(resolve(fn));
          return res;
        } catch (error) {
          dispatch(reject({ fn, error }));
          throw error;
        }
      })
    );
    return allResolved(promises);
  }

  const reset = () => {
    resetScheduler();
    dispatch(removeAllTasks());
  };

  const pendingTasks: Task[] = tasks.filter((task) => task.pending.length > 0);

  const errors = tasks.reduce(
    (list: TaskError[], task) => [
      ...list,
      ...task.rejected.map((r) => r.error),
    ],
    []
  );

  const progress =
    pendingTasks.length > 0
      ? pendingTasks.reduce((n, t) => n + taskProgress(t), 0) /
        pendingTasks.length
      : 1;

  const isPending = pendingTasks.length > 0;
  const isSettled = !isPending;

  return {
    progress,
    tasks: pendingTasks,
    errors,
    isPending,
    isSettled,
    track,
    reset,
  };
}
