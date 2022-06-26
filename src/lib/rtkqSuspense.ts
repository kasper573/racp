import { Api } from "@reduxjs/toolkit/query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyApi = Api<any, any, any, any, any>;

export function enhanceApiWithSuspense(api: AnyApi) {
  for (const endpointName in api.endpoints) {
    const endpoint = api.endpoints[endpointName];
    const { useQuery, useMutation } = endpoint;
    const useResourceQuery = (queryArg: unknown, ...rest: unknown[]) => {
      const res = useQuery.apply(endpoint, queryArg, ...rest);
      signalResource(api, endpointName, queryArg);
      return res;
    };
    const useResourceMutation = (...args: unknown[]) => {
      const res = useMutation.apply(endpoint, ...args);
      signalResource(api, endpointName, res[1].requestId);
      return res;
    };

    api[`use${capitalize(endpointName)}Query`] = useResourceQuery;
    api[`use${capitalize(endpointName)}Mutation`] = useResourceMutation;
  }
}

const capitalize = (m: string) => m[0].toUpperCase() + m.substring(1);

function signalResource(api: AnyApi, endpointName: string, arg: unknown) {
  const promise = api.util.getRunningOperationPromise(endpointName, arg);
  if (!promise) {
    return;
  }

  let pending = true;
  promise.then(
    () => (pending = false),
    () => (pending = false)
  );
  if (pending) {
    throw promise;
  }
}
