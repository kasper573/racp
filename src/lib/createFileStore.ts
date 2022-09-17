import * as fs from "fs";
import * as path from "path";
import { ensureDir } from "./ensureDir";
import { Logger } from "./logger";
import { watchFileInDirectory } from "./watchFileInDirectory";

export type FileStore = ReturnType<typeof createFileStore>;

export function createFileStore(directory: string, logger: Logger) {
  ensureDir(directory);
  return {
    directory,
    entry<Data>(
      relativeFilename: string,
      parseFileContent: ContentParser<Data>,
      onChange?: (data?: Data) => void
    ): FileStoreEntry<Data> {
      const entryLogger = logger.chain(relativeFilename);
      const filename = path.resolve(directory, relativeFilename);

      const watcher = watchFileInDirectory(directory, relativeFilename, reload);
      let currentData: Data | undefined;

      function setData (data?: Data) {
        currentData = data;
        entryLogger.log(
          "updated, new data:",
          currentData === undefined ? "undefined" : JSON.stringify(currentData)
        );
        onChange?.(data);
      }

      function reload() {
        try {
          const fileContent = fs.readFileSync(filename, "utf-8");
          const res = parseFileContent(fileContent);
          if (res.success) {
            setData(res.data)
          } else {
            entryLogger.log(
              `Could not load file, failed to parse its content. Received error: ${res}`
            );
          }
        } catch {
          setData(undefined);
        }
      }

      function update(fileContent: string) {
        const res = parseFileContent(fileContent);
        if (res.success) {
          fs.writeFileSync(filename, fileContent, "utf-8");
          setData(res.data);
        } else {
          entryLogger.log(
            `Could not update file. Failed to parse new content. Received error: ${res}`
          );
        }
        return res;
      }

      reload();

      return {
        get data() {
          return currentData;
        },
        update,
        close: () => watcher.close(),
      };
    },
  };
}

export interface FileStoreEntry<Data> {
  get data(): Data | undefined;
  update(fileContent: string): FileParseResult<Data>;
  close(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContentParser<T = any> = (
  fileContent: string
) => FileParseResult<T>;

export type FileParseResult<T> =
  | { success: true; data: T }
  | { success: false };
