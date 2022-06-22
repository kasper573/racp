import {
  combineReducers,
  configureStore,
  StateFromReducersMapObject,
} from "@reduxjs/toolkit";
import { client } from "./client";

const reducers = {
  [client.reducerPath]: client.reducer,
};

export type StoreState = StateFromReducersMapObject<typeof reducers>;

export function createStore() {
  return configureStore({
    reducer: combineReducers(reducers),
  });
}
