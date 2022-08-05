import { WriteStream } from "tty";
import { LogFn } from "./logger";

export function createEllipsisLogFn(writeStream: WriteStream): LogFn {
  return (...args) =>
    writeStream.write(ellipsis(args.join(" "), writeStream.columns) + "\n");
}

function ellipsis(str: string, max: number) {
  return str.length > max ? str.substring(0, max - 3) + "..." : str;
}
