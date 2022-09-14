import { v4 as uuid } from "uuid";
import { useEffect, useMemo, useReducer } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { groupBy } from "lodash";
import { allResolved } from "./allResolved";
import {
  SchedulerCallOptions,
  SchedulerHookOptions,
  useScheduler,
} from "./useScheduler";

export type TaskRejectionReason = unknown;

export type TaskId = string;

export type TaskState = "pending" | "resolved" | "rejected";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Task<T = any> {
  id: TaskId;
  fn: TaskFn<T>;
  group: string;
  state: "pending" | "resolved" | "rejected";
  rejectionReason?: TaskRejectionReason;
}

export interface TaskGroup extends Record<TaskState, Task[]> {
  name: string;
  all: Task[];
  settled: Task[];
}

export type InputTask<T> = { schedule?: SchedulerCallOptions } & Pick<
  Task<T>,
  "fn" | "group"
> &
  Partial<Pick<Task<T>, "id">>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TaskFn<T = any> = () => Promise<T>;

const slice = createSlice({
  name: "promiseTracker",
  initialState: [] as Task[],
  reducers: {
    add(all, { payload: tasks }: PayloadAction<Task[]>) {
      all.push(...tasks);
    },
    resolve(tasks, { payload: resolveId }: PayloadAction<TaskId>) {
      const task = tasks.find(({ id }) => id === resolveId);
      if (task) {
        task.state = "resolved";
        task.rejectionReason = undefined;
      }
    },
    reject(
      tasks,
      {
        payload: rejection,
      }: PayloadAction<{ id: TaskId; reason: TaskRejectionReason }>
    ) {
      const task = tasks.find(({ id }) => id === rejection.id);
      if (task) {
        task.state = "rejected";
        task.rejectionReason = rejection.reason;
      }
    },
    clear(tasks) {
      tasks.splice(0, tasks.length);
    },
  },
});

export function useTaskScheduler(options?: SchedulerHookOptions) {
  const [tasks, dispatch] = useReducer(slice.reducer, slice.getInitialState());
  const [schedule, resetScheduler] = useScheduler(options);
  const groups = useMemo(() => groupTasks(tasks), [tasks]);
  const progress = useMemo(() => groupSumProgress(groups), [groups]);
  const isPending = progress > 0 && progress < 1;
  const isSettled = !isPending;

  useEffect(() => reset, []);

  function reset() {
    resetScheduler();
    dispatch(slice.actions.clear());
  }

  function track<T>(inputTasks: InputTask<T>[]): Promise<T[]> {
    const tasks = inputTasks.map(normalizeInputTask);

    dispatch(slice.actions.add(tasks));

    const promises = tasks.map((task, index) =>
      schedule(async () => {
        try {
          const res = await task.fn();
          dispatch(slice.actions.resolve(task.id));
          return res;
        } catch (reason) {
          dispatch(slice.actions.reject({ id: task.id, reason }));
          throw reason;
        }
      }, inputTasks[index].schedule)
    );

    return allResolved(promises);
  }

  return {
    groups,
    tasks,
    progress,
    isPending,
    isSettled,
    track,
    reset,
  };
}

export function describeTaskGroup(group: TaskGroup) {
  return `${group.name} (${group.settled.length}/${group.all.length})`;
}

export function describeTask(task: Task) {
  return `${task.group}${task.id !== undefined ? `(${task.id})` : ""}`;
}

function groupTasks(tasks: Task[]): TaskGroup[] {
  return Object.entries(groupBy(tasks, "group")).map(([name, tasks]) => {
    const resolved = tasks.filter((task) => task.state === "resolved");
    const rejected = tasks.filter((task) => task.state === "rejected");
    return {
      name,
      all: tasks,
      pending: tasks.filter((task) => task.state === "pending"),
      resolved,
      rejected,
      settled: [...resolved, ...rejected],
    };
  });
}

function groupSumProgress(groups: TaskGroup[]) {
  const sum = groups.reduce((n, group) => n + groupProgress(group), 0);
  return sum / groups.length;
}

function groupProgress(group: TaskGroup) {
  return group.all.length === 0 ? 1 : group.settled.length / group.all.length;
}

function normalizeInputTask<T>({ id, ...props }: InputTask<T>): Task<T> {
  return {
    state: "pending" as const,
    id: id ?? uuid(),
    ...props,
  };
}
