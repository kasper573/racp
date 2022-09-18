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
      parseFileContent: ContentParser<Data>
    ): FileStoreEntry<Data> {
      const entryLogger = logger.chain(relativeFilename);
      const filename = path.resolve(directory, relativeFilename);

      let isAutoLoadEnabled = true;
      const watcher = watchFileInDirectory(directory, relativeFilename, () => {
        if (isAutoLoadEnabled) {
          loadFileContent();
        }
      });

      let currentData: Data | undefined;
      let currentFileContent: string | undefined;

      function setFileContent(
        fileContent?: string
      ): FileParseResult<Data | undefined> | "unchanged" {
        if (fileContent === currentFileContent) {
          return "unchanged";
        }

        if (fileContent !== undefined) {
          const res = parseFileContent(fileContent);
          if (res.success) {
            currentData = res.data;
            currentFileContent = fileContent;
          } else {
            entryLogger.error(
              `Could not parse file content. Received error: ${res.error}`
            );
            return res;
          }
        } else {
          currentData = undefined;
          currentFileContent = undefined;
        }

        entryLogger.log("updated, new size:", currentFileContent?.length ?? 0);
        return { success: true, data: currentData };
      }

      function loadFileContent() {
        let loadedContent: string | undefined;
        try {
          loadedContent = fs.readFileSync(filename, "utf-8");
        } catch {
          // File missing = content undefined
        }
        setFileContent(loadedContent);
      }

      function writeFileContent(
        newContent?: string
      ): FileParseResult<Data | undefined> {
        const res = setFileContent(newContent);
        if (res === "unchanged") {
          return { success: true, data: currentData };
        }

        if (!res.success) {
          return res;
        }

        try {
          if (newContent === undefined) {
            fs.rmSync(filename);
          } else {
            fs.writeFileSync(filename, newContent, "utf-8");
          }
          return res;
        } catch (error) {
          entryLogger.error(`Could not update file "${filename}": ${error}`);
          return { success: false, error };
        }
      }

      loadFileContent();

      return {
        get data() {
          return currentData;
        },
        update: writeFileContent,
        close: () => watcher.close(),
      };
    },
  };
}

export interface FileStoreEntry<Data> {
  get data(): Data | undefined;
  update(fileContent?: string): FileParseResult<Data | undefined>;
  close(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContentParser<T = any> = (
  fileContent: string
) => FileParseResult<T>;

export type FileParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: unknown };
