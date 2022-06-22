import {
  combineReducers,
  configureStore,
  StateFromReducersMapObject,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { client } from "./client";
import { auth } from "./slices/auth";

const reducers = {
  [client.reducerPath]: client.reducer,
  [auth.name]: auth.reducer,
};

export function createStore() {
  return configureStore({
    reducer: combineReducers(reducers),
  });
}

export type AppState = StateFromReducersMapObject<typeof reducers>;
export type AppDispatch = ReturnType<typeof createStore>["dispatch"];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
