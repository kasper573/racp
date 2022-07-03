import { Dispatch } from "redux";
import {
  AsyncThunkPayloadCreator,
  AsyncThunkOptions,
  createAsyncThunk,
} from "@reduxjs/toolkit";

export function createAsyncThunkFactory<Extra>() {
  type API = ThunkApiConfig<Extra>;
  return <Returned, ThunkArg, Extra>(
    typePrefix: string,
    payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, API>,
    options?: AsyncThunkOptions<ThunkArg, API>
  ) => createAsyncThunk(typePrefix, payloadCreator, options);
}

type ThunkApiConfig<Extra> = {
  state?: unknown;
  dispatch?: Dispatch;
  extra: Extra;
  rejectValue?: unknown;
  serializedErrorType?: unknown;
  pendingMeta?: unknown;
  fulfilledMeta?: unknown;
  rejectedMeta?: unknown;
};
