import { Dispatch as ReduxDispatch, Middleware } from "redux";
import { ZodType } from "zod";
import { typedKeys } from "./std/typedKeys";

export function rtkStorage<State>() {
  return function factory<
    DispatchExt,
    Dispatch extends ReduxDispatch,
    Parsers extends ParsersFor<State>
  >({
    parsers,
    read,
    write,
    isEqual,
  }: {
    parsers: Parsers;
    read: (key: keyof Parsers) => object;
    write: <K extends keyof State>(key: K, value: State[K]) => void;
    isEqual: <T>(updatedState: T, storedState: T) => boolean;
  }): {
    preloadedState: Partial<State>;
    storageMiddleware: Middleware<DispatchExt, State, Dispatch>;
  } {
    const preloadedState = typedKeys(parsers).reduce(
      (state: Partial<State>, key) => {
        const parseResult = parsers[key]?.safeParse(read(key));
        if (parseResult?.success) {
          return {
            ...state,
            [key]: parseResult.data,
          };
        }
        return state;
      },
      {}
    );
    return {
      preloadedState,
      storageMiddleware: (api) => {
        const storedState = { ...api.getState() };
        function save() {
          const updatedState = api.getState();
          for (const key of typedKeys(parsers) as Array<keyof State>) {
            const updatedValue = updatedState[key];
            const storedValue = storedState[key];
            if (!isEqual(storedValue, updatedValue)) {
              write(key, updatedValue);
              storedState[key] = updatedValue;
            }
          }
        }
        return (next) => (action) => {
          next(action);
          save();
        };
      },
    };
  };
}

export type ParsersFor<State> = Partial<{
  [K in keyof State]: ZodType<State[K]>;
}>;
