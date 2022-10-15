import { Logger } from "../logger";
import { FileRepository, FileRepositoryOptions } from "./FileRepository";

export type FileStore = ReturnType<typeof createFileStore>;

// TODO: refactor: use factory for predefining options
export function createFileStore(directory: string, logger: Logger) {
  return {
    directory,
    entry<Data>(
      options: Omit<FileRepositoryOptions<Data>, "directory" | "logger">
    ) {
      return new FileRepository({ directory, logger, ...options });
    },
  };
}
