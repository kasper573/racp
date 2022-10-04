import * as path from "path";
import * as fs from "fs";
import { Logger } from "../logger";
import { watchFileInDirectory } from "./watchFileInDirectory";
import { ensureDir } from "./ensureDir";

export type FileStore = ReturnType<typeof createFileStore>;

export function createFileStore(directory: string, parentLogger: Logger) {
  const logger = parentLogger.chain("fs");
  ensureDir(directory);
  return {
    directory,
    entry<Data>(
      relativeFilename: string,
      { parse, serialize }: FileStoreProtocol<Data>
    ): FileStoreEntry<Data> {
      const entryLogger = logger.chain(relativeFilename);
      const filename = path.resolve(directory, relativeFilename);

      let isWriting = false;
      const watcher = watchFileInDirectory(directory, relativeFilename, () => {
        if (!isWriting) {
          load();
        }
      });

      let currentData: Data | undefined;

      function load() {
        let fileContent: string | undefined;
        try {
          fileContent = fs.readFileSync(filename, "utf-8");
        } catch {
          // File missing = content undefined
        }
        if (fileContent !== undefined) {
          const res = parse(fileContent);
          if (res.success) {
            currentData = res.data;
          } else {
            entryLogger.error(
              `Could not parse file content. Received error: ${res.error}`
            );
            return;
          }
        } else {
          currentData = undefined;
        }
        entryLogger.log("Loaded. New size:", fileContent?.length ?? 0);
      }

      function write(data?: Data) {
        try {
          isWriting = true;
          if (data === undefined) {
            entryLogger.log("Removing file");
            fs.rmSync(filename);
          } else {
            const newFileContent = serialize(data);
            entryLogger.log("Writing. New size:", newFileContent.length);
            fs.writeFileSync(filename, newFileContent, "utf-8");
          }
          currentData = data;
        } catch (error) {
          entryLogger.error(`Could not update file "${filename}": ${error}`);
        } finally {
          isWriting = false;
        }
      }

      function assign(data: Data) {
        write({ ...currentData, ...data });
        return currentData;
      }

      load();

      return {
        get data() {
          return currentData;
        },
        write,
        assign,
        close: () => watcher.close(),
      };
    },
  };
}

export interface FileStoreProtocol<Data> {
  parse: (fileContent: string) => FileStoreParseResult<Data>;
  serialize: (data: Data) => string;
}

export interface FileStoreEntry<Data> {
  get data(): Data | undefined;
  write(data?: Data): void;
  assign(data: Data): Data | undefined;
  close(): void;
}

export type FileStoreParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: unknown };
