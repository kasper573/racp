import {
  combineReducers,
  configureStore,
  StateFromReducersMapObject,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { rtkStorage } from "../lib/rtkStorage";
import { client } from "./client";
import { auth, authState } from "./state/auth";
import { theme, themeState } from "./state/theme";

const reducers = {
  [client.reducerPath]: client.reducer,
  [auth.name]: auth.reducer,
  [theme.name]: theme.reducer,
};

const parsers = {
  [auth.name]: authState,
  [theme.name]: themeState,
};

export function createStore() {
  const { preloadedState, storageMiddleware } = rtkStorage<AppState>()({
    ...localStorageProtocol,
    parsers,
    isEqual,
  });

  return configureStore({
    preloadedState,
    reducer: combineReducers(reducers),
    middleware: (defaults) =>
      defaults().concat(client.middleware).concat(storageMiddleware),
  });
}

export type AppState = StateFromReducersMapObject<typeof reducers>;
export type AppDispatch = ReturnType<typeof createStore>["dispatch"];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

const localStorageProtocol = {
  read: (key: string) => JSON.parse(localStorage.getItem(key) ?? "null"),
  write: (key: string, value: unknown) =>
    localStorage.setItem(key, JSON.stringify(value)),
};
