import { createAsyncThunkFactory } from "../../lib/rtkThunkFactory";
import { AppThunkExtra } from "./store";

export const createAppAsyncThunk = createAsyncThunkFactory<AppThunkExtra>();

export const localStorageProtocol = {
  read: (key: string) => JSON.parse(localStorage.getItem(key) ?? "null"),
  write: (key: string, value: unknown) =>
    localStorage.setItem(key, JSON.stringify(value)),
};
