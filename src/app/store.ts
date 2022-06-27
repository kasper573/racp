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

export function createStore() {
  const { preloadedState, storageMiddleware } = rtkStorage({
    parsers: {
      [auth.name]: authState,
      [theme.name]: themeState,
    },
    read: (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
    write: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
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
