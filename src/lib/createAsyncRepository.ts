import { typedAssign } from "./typedAssign";

export function createAsyncRepository<Data, Props>(
  load: () => Promise<Data>,
  resolve: (data?: Data) => Props
) {
  const ready = Promise.resolve();
  const repository = {
    ready,
    ...resolve(),
  };
  repository.ready = load().then((data) => {
    typedAssign(repository, resolve(data));
  });
  return repository;
}
