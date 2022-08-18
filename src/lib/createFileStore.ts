import * as fs from "fs";
import * as path from "path";

export type FileStore = ReturnType<typeof createFileStore>;

export function createFileStore(directory: string) {
  ensureDir(directory);
  return {
    entry<Data>(
      relativeFilename: string,
      parseFileContent: ContentParser<Data>,
      onChange: (data?: Data) => void
    ) {
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
            currentData = res.data;
            onChange?.(res.data);
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
  update(fileContent: string): ParseResult<Data>;
  reload(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContentParser<T = any> = (fileContent: string) => ParseResult<T>;

export type ParseResult<T> = { success: true; data: T } | { success: false };

export function ensureDir(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  return directory;
}
