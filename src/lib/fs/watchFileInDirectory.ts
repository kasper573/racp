import * as fs from "fs";

export function watchFileInDirectory(
  directory: string,
  relativeFilename: string,
  onChange: (event: fs.WatchEventType) => void
) {
  return fs.watch(directory, (event, changedFilename) => {
    if (changedFilename === relativeFilename) {
      onChange(event);
    }
  });
}
