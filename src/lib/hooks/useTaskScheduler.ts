import { v4 as uuid } from "uuid";
import { useEffect, useMemo } from "react";
import { groupBy, uniq } from "lodash";
import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { allResolved } from "../std/allResolved";
import { useBottleneck } from "./useBottleneck";
import { useLatest } from "./useLatest";
import { useIsMounted } from "./useIsMounted";

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
  progress: number;
}

export type InputTask<T> = Pick<Task<T>, "fn" | "group"> &
  Partial<Pick<Task<T>, "id">>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TaskFn<T = any> = () => Promise<T>;

const taskStore = createStore<{
  tasks: Task[];
  add(tasks: Task[]): void;
  resolve(id: TaskId): void;
  reject(id: TaskId, reason: TaskRejectionReason): void;
  clear(): void;
}>()(
  immer((set) => ({
    tasks: [],
    add(newTasks) {
      set(({ tasks }) => {
        const newIds = newTasks.map((t) => t.id);
        const existing = tasks.find((task) => newIds.includes(task.id));
        if (existing) {
          throw new Error(`A task by id "${existing.id}" already exists`);
        }
        const uniqueNewIds = uniq(newIds);
        if (uniqueNewIds.length !== newIds.length) {
          throw new Error("Multiple tasks with the same id were provided");
        }
        tasks.push(...newTasks);
      });
    },
    resolve(resolveId) {
      set(({ tasks }) => {
        const task = tasks.find(({ id }) => id === resolveId);
        if (task) {
          task.state = "resolved";
          task.rejectionReason = undefined;
        }
      });
    },
    reject(rejectionId, reason) {
      set(({ tasks }) => {
        const task = tasks.find(({ id }) => id === rejectionId);
        if (task) {
          task.state = "rejected";
          task.rejectionReason = reason;
        }
      });
    },
    clear() {
      set((state) => {
        state.tasks = [];
      });
    },
  }))
);

export function useTaskScheduler() {
  const isSchedulerAlive = useIsMounted();
  const { tasks, ...actions } = useStore(taskStore);
  const schedule = useBottleneck();
  const groups = useMemo(() => groupTasks(tasks), [tasks]);
  const progress = useMemo(() => schedulerProgress(groups), [groups]);
  const isPending = progress < 1;
  const isSettled = !isPending;

  const latest = useLatest({ reset });
  useEffect(() => latest.current.reset, [latest]);
  useEffect(() => {});

  function reset() {
    actions.clear();
  }

  function track<T>(inputTasks: InputTask<T>[]): Promise<T[]> {
    const tasks = inputTasks.map(normalizeInputTask);

    actions.add(tasks);

    const promises = tasks.map((task) =>
      schedule(async () => {
        try {
          if (!isSchedulerAlive()) {
            throw new Error("Scheduler was killed");
          }
          const res = await task.fn();
          actions.resolve(task.id);
          return res;
        } catch (reason) {
          actions.reject(task.id, reason);
          throw reason;
        }
      })
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
  return `${task.group}${task.id !== undefined ? ` (${task.id})` : ""}`;
}

function groupTasks(tasks: Task[]): TaskGroup[] {
  return Object.entries(groupBy(tasks, "group")).map(([name, all]) => {
    const pending: Task[] = [];
    const resolved: Task[] = [];
    const rejected: Task[] = [];
    const settled: Task[] = [];
    for (const task of all) {
      switch (task.state) {
        case "pending":
          pending.push(task);
          break;
        case "resolved":
          settled.push(task);
          resolved.push(task);
          break;
        case "rejected":
          settled.push(task);
          rejected.push(task);
          break;
      }
    }
    return {
      name,
      all,
      pending,
      resolved,
      rejected,
      settled,
      progress: all.length > 0 ? settled.length / all.length : 1,
    };
  });
}

function normalizeInputTask<T>({ id, ...props }: InputTask<T>): Task<T> {
  return {
    state: "pending" as const,
    id: id ?? uuid(),
    ...props,
  };
}

function schedulerProgress(groups: TaskGroup[]) {
  const pendingGroups = groups.filter((group) => group.progress < 1);
  if (pendingGroups.length === 0) {
    return 1;
  }
  return (
    pendingGroups.reduce((sum, g) => sum + g.progress, 0) / pendingGroups.length
  );
}
