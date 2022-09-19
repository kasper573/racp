import { WriteStream } from "tty";
import { LogFn } from "./logger";

const fallbackColumns = 80;

export function createEllipsisLogFn(writeStream: WriteStream): LogFn {
  return (...args) =>
    writeStream.write(
      ellipsis(args.join(" "), writeStream.columns ?? fallbackColumns) +
        // Reset color in case ellipsis breaks coloring
        "\x1b[0m" +
        "\n"
    );
}

function ellipsis(str: string, max: number) {
  return str.length > max ? str.substring(0, max - 3) + "..." : str;
}
