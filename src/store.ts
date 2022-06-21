import {
  combineReducers,
  configureStore,
  StateFromReducersMapObject,
} from "@reduxjs/toolkit";

const reducers = {};

export type StoreState = StateFromReducersMapObject<typeof reducers>;

export const store = configureStore({
  reducer: combineReducers(reducers)
});

