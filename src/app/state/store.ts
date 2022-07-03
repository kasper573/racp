import {
  combineReducers,
  configureStore,
  StateFromReducersMapObject,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { History } from "history";
import { rtkStorage } from "../../lib/rtkStorage";
import { auth, authState } from "../slices/auth";
import { theme, themeState } from "../slices/theme";
import { client } from "./client";
import { localStorageProtocol } from "./utils";

const reducers = {
  [client.reducerPath]: client.reducer,
  [auth.name]: auth.reducer,
  [theme.name]: theme.reducer,
};

const parsers = {
  [auth.name]: authState,
  [theme.name]: themeState,
};

export function createStore(extraArgument: AppThunkExtra) {
  const { preloadedState, storageMiddleware } = rtkStorage<AppState>()({
    ...localStorageProtocol,
    parsers,
    isEqual,
  });

  return configureStore({
    preloadedState,
    reducer: combineReducers(reducers),
    middleware: (defaults) =>
      defaults({ thunk: { extraArgument } })
        .concat(client.middleware)
        .concat(storageMiddleware),
  });
}

export type AppState = StateFromReducersMapObject<typeof reducers>;
export type AppDispatch = ReturnType<typeof createStore>["dispatch"];
export type AppThunkExtra = { history: History; logoutRedirect?: string };

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
