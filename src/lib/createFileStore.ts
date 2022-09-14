import * as fs from "fs";
import * as path from "path";
import { ensureDir } from "./ensureDir";
import { Logger } from "./logger";

export type FileStore = ReturnType<typeof createFileStore>;

export function createFileStore(directory: string, logger: Logger) {
  ensureDir(directory);
  return {
    directory,
    entry<Data>(
      relativeFilename: string,
      parseFileContent: ContentParser<Data>,
      onChange?: (data?: Data) => void
    ) {
      const entryLogger = logger.chain(relativeFilename);
      const filename = path.resolve(directory, relativeFilename);

      let currentData: Data | undefined;

      const file: FileStoreEntry<Data> = {
        get data() {
          return currentData;
        },
        update: (fileContent: string) => {
          const res = parseFileContent(fileContent);
          if (res.success) {
            fs.writeFileSync(filename, fileContent, "utf-8");
            entryLogger.log("updated, new size:", fileContent.length);
            currentData = res.data;
            onChange?.(res.data);
          } else {
            entryLogger.log(
              `Could not update file. Failed to parse new content: ${res}`
            );
          }
          return res;
        },
        reload: () => {
          if (fs.existsSync(filename)) {
            file.update(fs.readFileSync(filename, "utf-8"));
          } else {
            currentData = undefined;
            onChange?.(undefined);
          }
        },
      };

      file.reload();

      return file;
    },
  };
}

export interface FileStoreEntry<Data> {
  get data(): Data | undefined;
  update(fileContent: string): FileParseResult<Data>;
  reload(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContentParser<T = any> = (
  fileContent: string
) => FileParseResult<T>;

export type FileParseResult<T> =
  | { success: true; data: T }
  | { success: false };
