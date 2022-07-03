export function singletons<VC extends ValueCreators>(
  valueCreators: VC
): SingletonValues<VC> {
  return new Proxy({} as SingletonValues<VC>, {
    get(target, str: string) {
      const prop = str as keyof VC;
      if (!Object.hasOwn(target, prop)) {
        target[prop] = valueCreators[prop]();
      }
      return target[prop];
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValueCreators = Readonly<Record<string, () => any>>;
export type SingletonValues<T extends ValueCreators> = {
  [K in keyof T]: ReturnType<T[K]>;
};
