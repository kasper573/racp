import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { client } from "./client";

export function createStore() {
  return configureStore({
    reducer: combineReducers({
      [client.reducerPath]: client.reducer,
    }),
  });
}
