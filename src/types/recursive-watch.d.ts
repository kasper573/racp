declare module "recursive-watch" {
  function watch<T>(
    fileOrDirectory: string,
    callback: (file: string) => void
  ): () => void;

  export = watch;
}
