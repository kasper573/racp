import { useReducer } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Task {
  name: string;
  pending: AnyPromise[];
  settled: AnyPromise[];
}

const slice = createSlice({
  name: "promiseTracker",
  initialState: [] as Task[],
  reducers: {
    addTask: (
      tasks,
      {
        payload: { name, promises },
      }: PayloadAction<{ name: string; promises: AnyPromise[] }>
    ) => {
      tasks.push({ name, pending: promises, settled: [] });
    },
    settle: (tasks, { payload: promise }: PayloadAction<AnyPromise>) => {
      for (const task of tasks) {
        const index = task.pending.indexOf(promise);
        if (index !== -1) {
          task.pending.splice(index, 1);
          task.settled.push(promise);
        }
      }
    },
    removeAllTasks: (tasks) => {
      tasks.splice(0, tasks.length);
    },
  },
});

const taskTotal = (task: Task) => task.pending.length + task.settled.length;
const taskProgress = (task: Task) => task.settled.length / taskTotal(task);

const { settle, addTask, removeAllTasks } = slice.actions;

export function usePromiseTracker() {
  const [tasks, dispatch] = useReducer(slice.reducer, slice.getInitialState());

  function track<P extends AnyPromise | AnyPromise[]>(name: string, p: P): P {
    const promises: AnyPromise[] = Array.isArray(p) ? p : [p];
    dispatch(addTask({ name, promises }));
    promises.forEach((promise) => {
      const onSettle = <T>(arg: T) => {
        dispatch(settle(promise));
        return arg;
      };
      promise.then(onSettle).catch(onSettle);
    });
    return p;
  }

  const reset = () => dispatch(removeAllTasks());

  const trackAll = <T>(promises: Promise<T>[], name: string) =>
    Promise.all(track(name, promises));

  const trackOne = <T>(promise: Promise<T>, task: string) =>
    track(task, promise);

  const progress =
    tasks.reduce((n, t) => n + taskProgress(t), 0) / tasks.length;
  const isPending = progress < 1 && tasks.length > 0;
  const isSettled = !isPending;

  const pendingTaskNames = tasks
    .filter((task) => taskProgress(task) < 1)
    .map((task) => task.name);

  return {
    progress,
    tasks: pendingTaskNames,
    isPending,
    isSettled,
    trackAll,
    trackOne,
    reset,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPromise = Promise<any>;
